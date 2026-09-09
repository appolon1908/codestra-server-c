from importlib import import_module

from django.db import migrations, models


def initialize(apps, schema_editor):
    apps.get_model("sales_scraper", "ScraperAdmissionLock").objects.using(
        schema_editor.connection.alias
    ).get_or_create(pk=1)
    # Also repair installations that applied the original 0003 before this fix.
    import_module("sales_scraper.migrations.0003_tenant_scoped_scraper_api").repair_legacy_jobs(
        apps, schema_editor
    )


class Migration(migrations.Migration):
    dependencies = [("sales_scraper", "0003_tenant_scoped_scraper_api")]
    operations = [
        migrations.CreateModel(
            name="ScraperAdmissionLock",
            fields=[("id", models.PositiveSmallIntegerField(primary_key=True, serialize=False))],
        ),
        migrations.RunPython(initialize, migrations.RunPython.noop),
    ]
