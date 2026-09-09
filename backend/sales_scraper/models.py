import uuid

from django.conf import settings
from django.db import models


class ScraperAdmissionLock(models.Model):
    """One seeded row serializes admission across tenants and principals."""

    id = models.PositiveSmallIntegerField(primary_key=True)


class ScraperTenantPrincipal(models.Model):
    """Server-side mapping from an authenticated middleware principal to a tenant."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="scraper_tenant_principal",
    )
    tenant_id = models.UUIDField(db_index=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


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
    request_payload_hash = models.CharField(max_length=64, default="")
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
                fields=["tenant_id", "idempotency_key_hash"],
                name="crawler_job_tenant_idempotency",
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


class ScraperOutboxEvent(models.Model):
    class State(models.TextChoices):
        PENDING = "pending"
        INFLIGHT = "inflight"
        DELIVERED = "delivered"
        RETRY_WAIT = "retry_wait"
        DEAD_LETTER = "dead_letter"

    event_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    candidate = models.OneToOneField(
        LeadCandidate, on_delete=models.PROTECT, related_name="outbox_event"
    )
    tenant_id = models.UUIDField(db_index=True)
    schema_version = models.CharField(max_length=64)
    schema_checksum = models.CharField(max_length=64)
    source_identifier = models.CharField(max_length=253)
    source_url = models.URLField(max_length=2048)
    observed_at = models.DateTimeField()
    payload = models.JSONField()
    payload_hash = models.CharField(max_length=64)
    idempotency_key = models.CharField(max_length=128, unique=True)
    compliance_state = models.CharField(max_length=32, default="review_required")
    rejection_reason = models.CharField(max_length=120, blank=True)
    state = models.CharField(
        max_length=16, choices=State.choices, default=State.PENDING, db_index=True
    )
    attempt_count = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=8)
    next_attempt_at = models.DateTimeField(null=True, blank=True, db_index=True)
    lease_owner = models.CharField(max_length=128, null=True, blank=True)
    lease_expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    correlation_id = models.UUIDField(default=uuid.uuid4, editable=False)
    acknowledgement_reference = models.CharField(max_length=200, blank=True)
    last_error_class = models.CharField(max_length=80, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [  # noqa: RUF012 - Django Meta declarative API
            models.Index(
                fields=["state", "next_attempt_at", "lease_expires_at"],
                name="scraper_outbox_claim_idx",
            )
        ]


class ScraperDeliveryAttempt(models.Model):
    event = models.ForeignKey(
        ScraperOutboxEvent, on_delete=models.PROTECT, related_name="attempts"
    )
    attempt_number = models.PositiveSmallIntegerField()
    correlation_id = models.UUIDField()
    outcome = models.CharField(max_length=32)
    response_status = models.PositiveSmallIntegerField(null=True)
    error_class = models.CharField(max_length=80, blank=True)
    payload_hash = models.CharField(max_length=64)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField()

    class Meta:
        constraints = [  # noqa: RUF012 - Django Meta declarative API
            models.UniqueConstraint(
                fields=["event", "attempt_number"],
                name="scraper_delivery_attempt_unique",
            )
        ]


class CrawlDomainState(models.Model):
    domain = models.CharField(max_length=253, unique=True)
    next_allowed_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
