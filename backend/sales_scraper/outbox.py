from __future__ import annotations

import hashlib
import json
from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import LeadCandidate, ScraperOutboxEvent


def canonical_json(value: dict) -> bytes:
    return json.dumps(
        value, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode()


def schema_checksum(schema_version: str) -> str:
    return hashlib.sha256(schema_version.encode()).hexdigest()


def enqueue_candidate(candidate: LeadCandidate) -> ScraperOutboxEvent:
    payload = {
        "event_id": str(candidate.candidate_id),
        "schema_version": candidate.schema_version,
        "tenant_id": str(candidate.tenant_id),
        "campaign_id": str(candidate.campaign_id),
        "source": {
            "identifier": candidate.company_domain,
            "url": candidate.contract["source_urls"][0],
            "observed_at": candidate.contract["provenance"]["retrieved_at"],
        },
        "compliance": {
            "state": "review_required",
            "consent": "unknown",
            "dnc": "not_evaluated",
        },
        "candidate": candidate.contract,
    }
    body_hash = hashlib.sha256(canonical_json(payload)).hexdigest()
    return ScraperOutboxEvent.objects.create(
        event_id=candidate.candidate_id,
        candidate=candidate,
        tenant_id=candidate.tenant_id,
        schema_version=candidate.schema_version,
        schema_checksum=schema_checksum(candidate.schema_version),
        source_identifier=candidate.company_domain,
        source_url=payload["source"]["url"],
        observed_at=payload["source"]["observed_at"],
        payload=payload,
        payload_hash=body_hash,
        idempotency_key=f"scraper:{candidate.candidate_id}",
    )


def claim_event(owner: str, lease_seconds: int) -> ScraperOutboxEvent | None:
    now = timezone.now()
    with transaction.atomic():
        event = (
            ScraperOutboxEvent.objects.select_for_update(skip_locked=True)
            .filter(
                Q(state=ScraperOutboxEvent.State.PENDING)
                | Q(state=ScraperOutboxEvent.State.RETRY_WAIT, next_attempt_at__lte=now)
                | Q(state=ScraperOutboxEvent.State.INFLIGHT, lease_expires_at__lte=now)
            )
            .order_by("created_at")
            .first()
        )
        if event is None:
            return None
        event.state = ScraperOutboxEvent.State.INFLIGHT
        event.lease_owner = owner
        event.lease_expires_at = now + timedelta(seconds=lease_seconds)
        event.save(
            update_fields=["state", "lease_owner", "lease_expires_at", "updated_at"]
        )
        return event


def redrive_event(event_id, actor: str) -> ScraperOutboxEvent:
    if not actor.strip():
        raise ValueError("audit_actor_required")
    with transaction.atomic():
        event = ScraperOutboxEvent.objects.select_for_update().get(event_id=event_id)
        if event.state != ScraperOutboxEvent.State.DEAD_LETTER:
            raise ValueError("only_dead_letter_events_can_be_redriven")
        event.state = ScraperOutboxEvent.State.PENDING
        event.next_attempt_at = None
        event.lease_owner = None
        event.lease_expires_at = None
        event.last_error_class = (
            f"redriven_by:{hashlib.sha256(actor.encode()).hexdigest()[:16]}"
        )
        event.save()
        return event
