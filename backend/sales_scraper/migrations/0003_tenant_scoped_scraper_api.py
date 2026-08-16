import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


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
