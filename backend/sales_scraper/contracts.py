import hashlib

from .models import CrawlJob

SCHEMA_VERSION = "lead-candidate.v1"


def create_job(*, tenant_id, campaign_id, start_urls, idempotency_key, policy=None):
    digest = hashlib.sha256(idempotency_key.encode()).hexdigest()
    job, created = CrawlJob.objects.get_or_create(
        tenant_id=tenant_id,
        campaign_id=campaign_id,
        idempotency_key_hash=digest,
        defaults={
            "start_urls": start_urls,
            "policy": policy or {},
            "schema_version": SCHEMA_VERSION,
        },
    )
    return job, created
