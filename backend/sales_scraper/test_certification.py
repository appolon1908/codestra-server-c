import hashlib
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor
from unittest import skipUnless

from django.db import close_old_connections, connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase, override_settings
from rest_framework.test import APIClient

from auth_app.models import User
from .contracts import IdempotencyConflict, create_job
from .models import CrawlJob, ScraperAdmissionLock, ScraperTenantPrincipal


class LegacyUpgradeTests(TransactionTestCase):
    def test_old_collisions_and_payloads_survive_upgrade_and_replay(self):
        executor = MigrationExecutor(connection)
        executor.migrate([("sales_scraper", "0002_scraper_outbox")])
        old = executor.loader.project_state([("sales_scraper", "0002_scraper_outbox")]).apps
        Job = old.get_model("sales_scraper", "CrawlJob")
        tenant = uuid.uuid4()
        key = "legacy-retry-key"
        digest = hashlib.sha256(key.encode()).hexdigest()
        campaigns = [uuid.uuid4(), uuid.uuid4()]
        original = []
        try:
            for campaign in campaigns:
                job = Job.objects.create(
                    tenant_id=tenant, campaign_id=campaign,
                    start_urls=["https://example.invalid/"], policy={"max_pages": 1},
                    idempotency_key_hash=digest,
                )
                original.append(job.job_id)
            executor = MigrationExecutor(connection)
            executor.migrate([("sales_scraper", "0004_admission_lock_legacy_repair")])
            self.assertEqual(CrawlJob.objects.count(), 2)
            self.assertEqual(CrawlJob.objects.values("tenant_id", "idempotency_key_hash").distinct().count(), 2)
            for campaign, job_id in zip(campaigns, original):
                job, created = create_job(
                    tenant_id=tenant, campaign_id=campaign,
                    start_urls=["https://example.invalid/"], policy={"max_pages": 1},
                    idempotency_key=key,
                )
                self.assertFalse(created)
                self.assertEqual(job.job_id, job_id)
                self.assertEqual(job.policy["_legacy_idempotency_key_hash"], digest)
                self.assertTrue(job.request_payload_hash)
            with self.assertRaises(IdempotencyConflict):
                create_job(tenant_id=tenant, campaign_id=uuid.uuid4(),
                           start_urls=["https://example.invalid/"], policy={"max_pages": 1},
                           idempotency_key=key)
            self.assertTrue(ScraperAdmissionLock.objects.filter(pk=1).exists())
            rollback = MigrationExecutor(connection)
            rollback.migrate([("sales_scraper", "0002_scraper_outbox")])
            old_job = rollback.loader.project_state([("sales_scraper", "0002_scraper_outbox")]).apps.get_model("sales_scraper", "CrawlJob")
            self.assertEqual(list(old_job.objects.values_list("idempotency_key_hash", flat=True)), [digest, digest])
        finally:
            MigrationExecutor(connection).migrate([("sales_scraper", "0004_admission_lock_legacy_repair")])


@skipUnless(connection.vendor == "postgresql", "Real PostgreSQL locks required")
class ConcurrentAdmissionTests(TransactionTestCase):
    def setUp(self):
        ScraperAdmissionLock.objects.get_or_create(pk=1)

    def submit_pair(self, same_tenant):
        barrier = threading.Barrier(2)
        shared_tenant = uuid.uuid4()
        users = []
        for i in range(2):
            user = User.objects.create_user(email=f"admission-{i}@example.invalid", first_name="Test", last_name="Only")
            ScraperTenantPrincipal.objects.create(user=user, tenant_id=shared_tenant if same_tenant else uuid.uuid4())
            users.append(user)

        def submit(i):
            close_old_connections()
            try:
                client = APIClient()
                client.force_authenticate(users[i])
                barrier.wait(timeout=10)
                response = client.post("/v1/scraper/jobs", {
                    "campaign_id": str(uuid.uuid4()), "start_urls": ["https://example.invalid/"],
                    "extraction_profile": "public-company-contact-v1", "policy": {"max_pages": 1},
                }, format="json", HTTP_IDEMPOTENCY_KEY=f"concurrent-key-{i}")
                return response.status_code
            finally:
                close_old_connections()
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(submit, range(2)))
        self.assertEqual(sorted(results), [201, 429])
        self.assertEqual(CrawlJob.objects.count(), 1)

    @override_settings(SCRAPER_GLOBAL_CONCURRENCY=1, SCRAPER_TENANT_CONCURRENCY=10)
    def test_global_limit_across_different_tenants(self):
        self.submit_pair(False)

    @override_settings(SCRAPER_GLOBAL_CONCURRENCY=10, SCRAPER_TENANT_CONCURRENCY=1)
    def test_tenant_limit_across_different_principals(self):
        self.submit_pair(True)

    @override_settings(SCRAPER_GLOBAL_CONCURRENCY=10, SCRAPER_TENANT_CONCURRENCY=10,
                       SCRAPER_TENANT_HOURLY_QUOTA=1)
    def test_hourly_quota_across_different_principals(self):
        self.submit_pair(True)

    @override_settings(SCRAPER_GLOBAL_CONCURRENCY=10, SCRAPER_TENANT_CONCURRENCY=10,
                       SCRAPER_TENANT_HOURLY_QUOTA=100, SCRAPER_TENANT_DAILY_QUOTA=1)
    def test_daily_quota_across_different_principals(self):
        self.submit_pair(True)
