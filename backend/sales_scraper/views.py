from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .contracts import create_job
from .models import CrawlJob
from .serializers import CrawlJobRequestSerializer


class CrawlJobCollectionView(APIView):
    permission_classes = [permissions.IsAdminUser]  # noqa: RUF012 - DRF API

    def post(self, request):
        serializer = CrawlJobRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        job, created = create_job(
            tenant_id=data["tenant_id"],
            campaign_id=data["campaign_id"],
            start_urls=data["start_urls"],
            idempotency_key=data["idempotency_key"],
            policy=data["policy"],
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


class CrawlJobDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]  # noqa: RUF012 - DRF API

    def get(self, request, job_id):
        job = CrawlJob.objects.get(job_id=job_id)
        return Response(
            {
                "schema_version": job.schema_version,
                "job_id": job.job_id,
                "tenant_id": job.tenant_id,
                "campaign_id": job.campaign_id,
                "state": job.state,
                "attempts": job.attempts,
                "candidates": [item.contract for item in job.candidates.all()],
            }
        )


class CrawlJobCancelView(APIView):
    permission_classes = [permissions.IsAdminUser]  # noqa: RUF012 - DRF API

    def post(self, request, job_id):
        job = CrawlJob.objects.get(job_id=job_id)
        if job.state not in {
            CrawlJob.State.COMPLETED,
            CrawlJob.State.CANCELLED,
            CrawlJob.State.DEAD_LETTER,
        }:
            job.cancel_requested_at = timezone.now()
            job.save(update_fields=["cancel_requested_at", "updated_at"])
        return Response({"job_id": job.job_id, "cancel_requested": True})
