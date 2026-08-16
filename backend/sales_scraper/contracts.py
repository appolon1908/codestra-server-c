import hashlib
import json

from .models import CrawlJob

SCHEMA_VERSION = "lead-candidate.v1"


class IdempotencyConflict(ValueError):
    pass


def _payload_hash(*, campaign_id, start_urls, policy, extraction_profile):
    payload = {
        "campaign_id": str(campaign_id),
        "start_urls": start_urls,
        "policy": policy or {},
        "extraction_profile": extraction_profile,
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


def create_job(
    *,
    tenant_id,
    campaign_id,
    start_urls,
    idempotency_key,
    policy=None,
    extraction_profile="public-company-contact-v1",
):
    digest = hashlib.sha256(idempotency_key.encode()).hexdigest()
    payload_hash = _payload_hash(
        campaign_id=campaign_id,
        start_urls=start_urls,
        policy=policy,
        extraction_profile=extraction_profile,
    )
    job, created = CrawlJob.objects.get_or_create(
        tenant_id=tenant_id,
        idempotency_key_hash=digest,
        defaults={
            "campaign_id": campaign_id,
            "start_urls": start_urls,
            "policy": {**(policy or {}), "extraction_profile": extraction_profile},
            "schema_version": SCHEMA_VERSION,
            "request_payload_hash": payload_hash,
            "max_attempts": int((policy or {}).get("max_retries", 2)) + 1,
        },
    )
    if not created and job.request_payload_hash != payload_hash:
        raise IdempotencyConflict("idempotency_key_payload_mismatch")
    return job, created
