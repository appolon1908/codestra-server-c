import uuid

from django.db import models


class CrawlJob(models.Model):
    class State(models.TextChoices):
        QUEUED = "QUEUED"
        LEASED = "LEASED"
        RUNNING = "RUNNING"
        COMPLETED = "COMPLETED"
        CANCELLED = "CANCELLED"
        RETRY_WAIT = "RETRY_WAIT"
        DEAD_LETTER = "DEAD_LETTER"

    job_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    tenant_id = models.UUIDField(db_index=True)
    campaign_id = models.UUIDField(db_index=True)
    schema_version = models.CharField(max_length=24, default="lead-candidate.v1")
    start_urls = models.JSONField(default=list)
    policy = models.JSONField(default=dict)
    state = models.CharField(
        max_length=20, choices=State.choices, default=State.QUEUED, db_index=True
    )
    idempotency_key_hash = models.CharField(max_length=64)
    lease_owner = models.CharField(max_length=128, null=True, blank=True)
    lease_expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    next_attempt_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=3)
    cancel_requested_at = models.DateTimeField(null=True, blank=True)
    failure_code = models.CharField(max_length=80, blank=True)
    failure_detail = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [  # noqa: RUF012 - Django Meta declarative API
            models.UniqueConstraint(
                fields=["tenant_id", "campaign_id", "idempotency_key_hash"],
                name="crawler_job_tenant_campaign_idempotency",
            )
        ]
        indexes = [  # noqa: RUF012 - Django Meta declarative API
            models.Index(
                fields=["state", "next_attempt_at", "lease_expires_at"],
                name="crawler_claim_idx",
            )
        ]


class CrawlPage(models.Model):
    job = models.ForeignKey(CrawlJob, on_delete=models.CASCADE, related_name="pages")
    url = models.URLField(max_length=2048)
    depth = models.PositiveSmallIntegerField()
    status_code = models.PositiveSmallIntegerField(null=True)
    content_type = models.CharField(max_length=160, blank=True)
    content_hash = models.CharField(max_length=64, blank=True, db_index=True)
    retrieved_at = models.DateTimeField(null=True)
    rejection_reason = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [  # noqa: RUF012 - Django Meta declarative API
            models.UniqueConstraint(
                fields=["job", "url"], name="crawler_job_page_unique"
            )
        ]


class LeadCandidate(models.Model):
    candidate_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    job = models.ForeignKey(
        CrawlJob, on_delete=models.CASCADE, related_name="candidates"
    )
    tenant_id = models.UUIDField(db_index=True)
    campaign_id = models.UUIDField(db_index=True)
    schema_version = models.CharField(max_length=24, default="lead-candidate.v1")
    company_domain = models.CharField(max_length=253)
    normalized_identity_hash = models.CharField(max_length=64)
    contract = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [  # noqa: RUF012 - Django Meta declarative API
            models.UniqueConstraint(
                fields=["tenant_id", "campaign_id", "normalized_identity_hash"],
                name="lead_candidate_tenant_campaign_identity",
            )
        ]


class CrawlDomainState(models.Model):
    domain = models.CharField(max_length=253, unique=True)
    next_allowed_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
