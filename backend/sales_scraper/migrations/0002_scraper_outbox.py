import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("sales_scraper", "0001_initial")]  # noqa: RUF012
    operations = [  # noqa: RUF012
        migrations.CreateModel(
            name="ScraperOutboxEvent",
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
                    "event_id",
                    models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
                ),
                ("tenant_id", models.UUIDField(db_index=True)),
                ("schema_version", models.CharField(max_length=64)),
                ("schema_checksum", models.CharField(max_length=64)),
                ("source_identifier", models.CharField(max_length=253)),
                ("source_url", models.URLField(max_length=2048)),
                ("observed_at", models.DateTimeField()),
                ("payload", models.JSONField()),
                ("payload_hash", models.CharField(max_length=64)),
                ("idempotency_key", models.CharField(max_length=128, unique=True)),
                (
                    "compliance_state",
                    models.CharField(default="review_required", max_length=32),
                ),
                ("rejection_reason", models.CharField(blank=True, max_length=120)),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("inflight", "Inflight"),
                            ("delivered", "Delivered"),
                            ("retry_wait", "Retry Wait"),
                            ("dead_letter", "Dead Letter"),
                        ],
                        db_index=True,
                        default="pending",
                        max_length=16,
                    ),
                ),
                ("attempt_count", models.PositiveSmallIntegerField(default=0)),
                ("max_attempts", models.PositiveSmallIntegerField(default=8)),
                (
                    "next_attempt_at",
                    models.DateTimeField(blank=True, db_index=True, null=True),
                ),
                (
                    "lease_owner",
                    models.CharField(blank=True, max_length=128, null=True),
                ),
                (
                    "lease_expires_at",
                    models.DateTimeField(blank=True, db_index=True, null=True),
                ),
                (
                    "correlation_id",
                    models.UUIDField(default=uuid.uuid4, editable=False),
                ),
                (
                    "acknowledgement_reference",
                    models.CharField(blank=True, max_length=200),
                ),
                ("last_error_class", models.CharField(blank=True, max_length=80)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("delivered_at", models.DateTimeField(blank=True, null=True)),
                (
                    "candidate",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="outbox_event",
                        to="sales_scraper.leadcandidate",
                    ),
                ),
            ],
            options={
                "indexes": [
                    models.Index(
                        fields=["state", "next_attempt_at", "lease_expires_at"],
                        name="scraper_outbox_claim_idx",
                    )
                ]
            },
        ),
        migrations.CreateModel(
            name="ScraperDeliveryAttempt",
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
                ("attempt_number", models.PositiveSmallIntegerField()),
                ("correlation_id", models.UUIDField()),
                ("outcome", models.CharField(max_length=32)),
                ("response_status", models.PositiveSmallIntegerField(null=True)),
                ("error_class", models.CharField(blank=True, max_length=80)),
                ("payload_hash", models.CharField(max_length=64)),
                ("started_at", models.DateTimeField()),
                ("completed_at", models.DateTimeField()),
                (
                    "event",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="attempts",
                        to="sales_scraper.scraperoutboxevent",
                    ),
                ),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(
                        fields=("event", "attempt_number"),
                        name="scraper_delivery_attempt_unique",
                    )
                ]
            },
        ),
    ]
