import hashlib
from datetime import timedelta

from django.http import Http404
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import exceptions, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .contracts import IdempotencyConflict, create_job
from .models import CrawlJob, ScraperAdmissionLock, ScraperTenantPrincipal
from .serializers import CrawlJobRequestSerializer


class TenantScopedScraperView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # noqa: RUF012 - DRF API

    def tenant_id(self, request):
        try:
            principal = ScraperTenantPrincipal.objects.get(
                user=request.user, active=True
            )
        except ScraperTenantPrincipal.DoesNotExist as exc:
            raise exceptions.PermissionDenied(
                "scraper_tenant_mapping_required"
            ) from exc
        return principal.tenant_id

    def job(self, request, job_id):
        try:
            return CrawlJob.objects.get(
                job_id=job_id, tenant_id=self.tenant_id(request)
            )
        except CrawlJob.DoesNotExist as exc:
            raise Http404 from exc


class CrawlJobCollectionView(TenantScopedScraperView):
    def post(self, request):
        serializer = CrawlJobRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        idempotency_key = request.headers.get("Idempotency-Key", "").strip()
        if not 8 <= len(idempotency_key) <= 200:
            raise serializers.ValidationError(
                {"Idempotency-Key": "an 8-200 character header is required"}
            )
        try:
            with transaction.atomic():
                try:
                    ScraperAdmissionLock.objects.select_for_update().get(pk=1)
                except ScraperAdmissionLock.DoesNotExist:
                    return Response(
                        {"code": "admission_lock_unavailable"},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
                try:
                    principal = ScraperTenantPrincipal.objects.select_for_update().get(
                        user=request.user, active=True
                    )
                except ScraperTenantPrincipal.DoesNotExist as exc:
                    raise exceptions.PermissionDenied(
                        "scraper_tenant_mapping_required"
                    ) from exc
                now = timezone.now()
                key_hash = hashlib.sha256(idempotency_key.encode()).hexdigest()
                existing = CrawlJob.objects.filter(
                    Q(idempotency_key_hash=key_hash)
                    | Q(policy___legacy_idempotency_key_hash=key_hash),
                    tenant_id=principal.tenant_id,
                ).exists()
                active_states = [
                    CrawlJob.State.QUEUED,
                    CrawlJob.State.LEASED,
                    CrawlJob.State.RUNNING,
                    CrawlJob.State.RETRY_WAIT,
                ]
                if (
                    not existing
                    and CrawlJob.objects.filter(state__in=active_states).count()
                    >= settings.SCRAPER_GLOBAL_CONCURRENCY
                ):
                    return Response(
                        {"code": "global_concurrency_limit"},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
                tenant_jobs = CrawlJob.objects.filter(tenant_id=principal.tenant_id)
                if (
                    not existing
                    and tenant_jobs.filter(state__in=active_states).count()
                    >= settings.SCRAPER_TENANT_CONCURRENCY
                ):
                    return Response(
                        {"code": "tenant_concurrency_limit"},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
                if (
                    not existing
                    and tenant_jobs.filter(
                        created_at__gte=now - timedelta(hours=1)
                    ).count()
                    >= settings.SCRAPER_TENANT_HOURLY_QUOTA
                ):
                    return Response(
                        {"code": "tenant_hourly_quota"},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
                if (
                    not existing
                    and tenant_jobs.filter(
                        created_at__gte=now - timedelta(days=1)
                    ).count()
                    >= settings.SCRAPER_TENANT_DAILY_QUOTA
                ):
                    return Response(
                        {"code": "tenant_daily_quota"},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
                job, created = create_job(
                    tenant_id=principal.tenant_id,
                    campaign_id=data["campaign_id"],
                    start_urls=data["start_urls"],
                    idempotency_key=idempotency_key,
                    policy=data["policy"],
                    extraction_profile=data["extraction_profile"],
                )
        except IdempotencyConflict:
            return Response(
                {"code": "idempotency_key_payload_mismatch"},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(
            {
                "schema_version": job.schema_version,
                "job_id": job.job_id,
                "state": job.state,
                "created": created,
                "middleware_delivery_enabled": False,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CrawlJobDetailView(TenantScopedScraperView):
    def get(self, request, job_id):
        job = self.job(request, job_id)
        return Response(
            {
                "schema_version": job.schema_version,
                "job_id": job.job_id,
                "campaign_id": job.campaign_id,
                "state": job.state,
                "attempts": job.attempts,
                "created_at": job.created_at,
                "updated_at": job.updated_at,
                "completed_at": job.completed_at,
                "cancel_requested_at": job.cancel_requested_at,
                "failure_code": job.failure_code,
            }
        )

    def delete(self, request, job_id):
        return request_cancellation(self.job(request, job_id))


class CrawlJobResultsView(TenantScopedScraperView):
    def get(self, request, job_id):
        job = self.job(request, job_id)
        try:
            limit = min(max(int(request.query_params.get("limit", 50)), 1), 100)
            offset = max(int(request.query_params.get("offset", 0)), 0)
        except ValueError as exc:
            raise serializers.ValidationError("invalid pagination") from exc
        rows = job.candidates.order_by("created_at")[offset : offset + limit + 1]
        items = [row.contract for row in rows[:limit]]
        return Response(
            {
                "job_id": job.job_id,
                "results": items,
                "next_offset": offset + limit if len(rows) > limit else None,
            }
        )


class CrawlJobCancelView(TenantScopedScraperView):
    def post(self, request, job_id):
        return request_cancellation(self.job(request, job_id))

    delete = post


def request_cancellation(job):
    if job.state not in {
        CrawlJob.State.COMPLETED,
        CrawlJob.State.CANCELLED,
        CrawlJob.State.DEAD_LETTER,
    }:
        job.cancel_requested_at = timezone.now()
        job.save(update_fields=["cancel_requested_at", "updated_at"])
    return Response({"job_id": job.job_id, "cancel_requested": True})
