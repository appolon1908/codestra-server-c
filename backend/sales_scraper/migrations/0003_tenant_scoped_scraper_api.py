import hashlib
import json

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models



def repair_legacy_jobs(apps, schema_editor):
    """Preserve legacy replay aliases and payloads before narrowing uniqueness."""
    Job = apps.get_model("sales_scraper", "CrawlJob")
    jobs = Job.objects.using(schema_editor.connection.alias)
    seen = set()
    for job in jobs.order_by("created_at", "job_id").iterator():
        original_key = job.idempotency_key_hash
        if not job.request_payload_hash:
            policy = dict(job.policy or {})
            profile = policy.pop("extraction_profile", "public-company-contact-v1")
            policy.pop("_legacy_idempotency_key_hash", None)
            payload = {"campaign_id": str(job.campaign_id), "start_urls": job.start_urls,
                       "policy": policy, "extraction_profile": profile}
            job.request_payload_hash = hashlib.sha256(
                json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
            ).hexdigest()
            job.policy = {**(job.policy or {}), "_legacy_idempotency_key_hash": original_key}
        identity = (job.tenant_id, original_key)
        if identity in seen:
            # Keep every job and its old-key alias. Only the internal unique key changes.
            job.policy = {**(job.policy or {}), "_legacy_idempotency_key_hash": original_key}
            nonce = 0
            while True:
                replacement = hashlib.sha256(
                    f"legacy:{job.job_id}:{original_key}:{nonce}".encode()
                ).hexdigest()
                if not jobs.filter(tenant_id=job.tenant_id, idempotency_key_hash=replacement).exists():
                    break
                nonce += 1
            job.idempotency_key_hash = replacement
        seen.add(identity)
        job.save(using=schema_editor.connection.alias,
                 update_fields=["request_payload_hash", "policy", "idempotency_key_hash"])


def restore_legacy_keys(apps, schema_editor):
    Job = apps.get_model("sales_scraper", "CrawlJob")
    for job in Job.objects.using(schema_editor.connection.alias).all().iterator():
        policy = dict(job.policy or {})
        original = policy.pop("_legacy_idempotency_key_hash", None)
        if original is not None:
            job.idempotency_key_hash = original
            job.policy = policy
            job.save(using=schema_editor.connection.alias, update_fields=["idempotency_key_hash", "policy"])


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("sales_scraper", "0002_scraper_outbox"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScraperTenantPrincipal",
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
                ("tenant_id", models.UUIDField(db_index=True)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="scraper_tenant_principal",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="crawljob",
            name="request_payload_hash",
            field=models.CharField(default="", max_length=64),
        ),
        migrations.RunPython(repair_legacy_jobs, restore_legacy_keys),
        migrations.RemoveConstraint(
            model_name="crawljob",
            name="crawler_job_tenant_campaign_idempotency",
        ),
        migrations.AddConstraint(
            model_name="crawljob",
            constraint=models.UniqueConstraint(
                fields=("tenant_id", "idempotency_key_hash"),
                name="crawler_job_tenant_idempotency",
            ),
        ),
    ]
