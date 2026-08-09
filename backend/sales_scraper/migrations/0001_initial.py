import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies: list[tuple[str, str]] = []  # noqa: RUF012 - Django migration API
    operations = [  # noqa: RUF012 - Django migration API
        migrations.CreateModel(
            name="CrawlDomainState",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("domain", models.CharField(max_length=253, unique=True)),
                ("next_allowed_at", models.DateTimeField()),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="CrawlJob",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "job_id",
                    models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
                ),
                ("tenant_id", models.UUIDField(db_index=True)),
                ("campaign_id", models.UUIDField(db_index=True)),
                (
                    "schema_version",
                    models.CharField(default="lead-candidate.v1", max_length=24),
                ),
                ("start_urls", models.JSONField(default=list)),
                ("policy", models.JSONField(default=dict)),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("QUEUED", "Queued"),
                            ("LEASED", "Leased"),
                            ("RUNNING", "Running"),
                            ("COMPLETED", "Completed"),
                            ("CANCELLED", "Cancelled"),
                            ("RETRY_WAIT", "Retry Wait"),
                            ("DEAD_LETTER", "Dead Letter"),
                        ],
                        db_index=True,
                        default="QUEUED",
                        max_length=20,
                    ),
                ),
                ("idempotency_key_hash", models.CharField(max_length=64)),
                (
                    "lease_owner",
                    models.CharField(blank=True, max_length=128, null=True),
                ),
                (
                    "lease_expires_at",
                    models.DateTimeField(blank=True, db_index=True, null=True),
                ),
                ("next_attempt_at", models.DateTimeField(blank=True, null=True)),
                ("attempts", models.PositiveSmallIntegerField(default=0)),
                ("max_attempts", models.PositiveSmallIntegerField(default=3)),
                ("cancel_requested_at", models.DateTimeField(blank=True, null=True)),
                ("failure_code", models.CharField(blank=True, max_length=80)),
                ("failure_detail", models.CharField(blank=True, max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "indexes": [
                    models.Index(
                        fields=["state", "next_attempt_at", "lease_expires_at"],
                        name="crawler_claim_idx",
                    )
                ],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("tenant_id", "campaign_id", "idempotency_key_hash"),
                        name="crawler_job_tenant_campaign_idempotency",
                    )
                ],
            },
        ),
        migrations.CreateModel(
            name="CrawlPage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("url", models.URLField(max_length=2048)),
                ("depth", models.PositiveSmallIntegerField()),
                ("status_code", models.PositiveSmallIntegerField(null=True)),
                ("content_type", models.CharField(blank=True, max_length=160)),
                (
                    "content_hash",
                    models.CharField(blank=True, db_index=True, max_length=64),
                ),
                ("retrieved_at", models.DateTimeField(null=True)),
                ("rejection_reason", models.CharField(blank=True, max_length=120)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "job",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pages",
                        to="sales_scraper.crawljob",
                    ),
                ),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(
                        fields=("job", "url"), name="crawler_job_page_unique"
                    )
                ]
            },
        ),
        migrations.CreateModel(
            name="LeadCandidate",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "candidate_id",
                    models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
                ),
                ("tenant_id", models.UUIDField(db_index=True)),
                ("campaign_id", models.UUIDField(db_index=True)),
                (
                    "schema_version",
                    models.CharField(default="lead-candidate.v1", max_length=24),
                ),
                ("company_domain", models.CharField(max_length=253)),
                ("normalized_identity_hash", models.CharField(max_length=64)),
                ("contract", models.JSONField(default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "job",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="candidates",
                        to="sales_scraper.crawljob",
                    ),
                ),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(
                        fields=("tenant_id", "campaign_id", "normalized_identity_hash"),
                        name="lead_candidate_tenant_campaign_identity",
                    )
                ]
            },
        ),
    ]
