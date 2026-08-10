from __future__ import annotations

import socket
import uuid
from datetime import timedelta
from unittest.mock import Mock, patch

from django.conf import settings
from django.test import SimpleTestCase, TestCase
from django.utils import timezone

from .contracts import create_job
from .crawler import (
    CrawlError,
    DatabaseDomainLimiter,
    DomainLimiter,
    FetchResult,
    PinnedFetcher,
    RobotsPolicy,
    claim_job,
    process_job,
)
from .extraction import extract_lead
from .models import CrawlJob, LeadCandidate
from .security import (
    ResolvedURL,
    UnsafeURL,
    is_public_address,
    validate_dns_pin,
    validate_public_url,
)

PUBLIC_URL = "https://93.184.216.34/"


def resolver_for(*addresses):
    return lambda host, port, type=None: [
        (
            socket.AF_INET6 if ":" in value else socket.AF_INET,
            socket.SOCK_STREAM,
            6,
            "",
            (value, port, 0, 0) if ":" in value else (value, port),
        )
        for value in addresses
    ]


class SecurityTests(SimpleTestCase):
    def test_rejects_credentials_and_non_http(self):
        for url in (
            "https://user:pass@example.com",
            "file:///etc/passwd",
            "ftp://example.com",
        ):
            with self.assertRaises(UnsafeURL):
                validate_public_url(url, resolver_for("93.184.216.34"))

    def test_ipv4_and_ipv6_restrictions(self):
        blocked = [
            "127.0.0.1",
            "10.0.0.1",
            "169.254.169.254",
            "0.0.0.0",
            "::1",
            "fc00::1",
            "fe80::1",
            "2001:db8::1",
        ]
        for value in blocked:
            self.assertFalse(is_public_address(value), value)
        self.assertTrue(is_public_address("8.8.8.8"))
        self.assertTrue(is_public_address("2606:4700:4700::1111"))

    def test_dns_rebinding(self):
        first = validate_public_url(
            "https://example.com", resolver_for("93.184.216.34")
        )
        with self.assertRaisesRegex(UnsafeURL, "dns_rebinding_detected"):
            validate_dns_pin(first, resolver_for("8.8.8.8"))

    def test_redirect_validation_contract(self):
        for target in ("http://127.0.0.1/", "http://169.254.169.254/latest/meta-data/"):
            with self.assertRaises(UnsafeURL):
                validate_public_url(target)

    @patch("sales_scraper.crawler.urllib3.HTTPConnectionPool")
    @patch("sales_scraper.crawler.validate_dns_pin")
    @patch("sales_scraper.crawler.validate_public_url")
    def test_redirect_chain_revalidates_each_target(
        self, validate_url, validate_pin, pool_class
    ):
        initial = ResolvedURL(
            "http://example.com/", "example.com", 80, ("93.184.216.34",)
        )
        validate_url.side_effect = [initial, UnsafeURL("non_public_address")]
        response = Mock(
            status=302,
            headers={"Location": "http://127.0.0.1/private"},
        )
        pool_class.return_value.urlopen.return_value = response

        with self.assertRaisesRegex(UnsafeURL, "non_public_address"):
            PinnedFetcher().fetch("http://example.com/")

        self.assertEqual(validate_url.call_count, 2)
        validate_pin.assert_called_once_with(initial)
        response.release_conn.assert_called_once()

    @patch("sales_scraper.crawler.urllib3.HTTPConnectionPool")
    @patch("sales_scraper.crawler.validate_dns_pin")
    @patch("sales_scraper.crawler.validate_public_url")
    def test_declared_response_size_is_enforced(
        self, validate_url, validate_pin, pool_class
    ):
        resolved = ResolvedURL(
            "http://example.com/", "example.com", 80, ("93.184.216.34",)
        )
        validate_url.return_value = resolved
        response = Mock(status=200, headers={"Content-Length": "101"})
        pool_class.return_value.urlopen.return_value = response

        with self.assertRaisesRegex(CrawlError, "response_too_large"):
            PinnedFetcher(max_bytes=100).fetch("http://example.com/")

        validate_pin.assert_called_once_with(resolved)
        response.read.assert_not_called()
        response.release_conn.assert_called_once()


class ExtractionTests(SimpleTestCase):
    HTML = b"""<html><head><title>Acme Public Ltd</title><script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Acme Public Ltd","email":"sales@acme.example","telephone":"+1 202 555 0199","address":{"streetAddress":"1 Public Road"},"knowsAbout":["consulting","software"]}</script></head><body><a href="mailto:hello@acme.example">Email</a><a href="tel:+12025550199">Call</a><p>Contact Jane Public, Chief Example Officer.</p></body></html>"""

    def test_extracts_supported_fields_jsonld_schema_mailto_tel_evidence_hash(self):
        result, _ = extract_lead(
            "https://example.com/about", self.HTML, "2026-08-08T00:00:00Z"
        )
        self.assertEqual(result["company"]["name"], "Acme Public Ltd")
        self.assertEqual(result["company"]["domain"], "example.com")
        self.assertEqual(result["company"]["email"], "sales@acme.example")
        self.assertEqual(result["company"]["telephone"], "+1 202 555 0199")
        self.assertEqual(result["company"]["address"]["streetAddress"], "1 Public Road")
        self.assertEqual(result["company"]["services"], ["consulting", "software"])
        self.assertIn("hello@acme.example", result["extracted_values"]["mailto"])
        self.assertIn("+12025550199", result["extracted_values"]["tel"])
        self.assertTrue(result["evidence"])
        self.assertEqual(len(result["content_hashes"]["https://example.com/about"]), 64)

    def test_unknown_fields_remain_null_and_names_not_fabricated(self):
        result, _ = extract_lead(
            "https://example.com",
            b"<html><body>Welcome</body></html>",
            "2026-08-08T00:00:00Z",
        )
        self.assertIsNone(result["company"]["name"])
        self.assertIsNone(result["company"]["email"])
        self.assertIsNone(result["contact"]["name"])
        self.assertIsNone(result["contact"]["title"])


class RobotsAndLimitsTests(SimpleTestCase):
    def test_robots_allowed_and_denied(self):
        fetcher = Mock()
        fetcher.fetch.return_value = FetchResult(
            "https://example.com/robots.txt",
            200,
            {"Content-Type": "text/plain"},
            b"User-agent: *\nDisallow: /private\nAllow: /",
        )
        policy = RobotsPolicy(fetcher)
        self.assertTrue(policy.allowed("https://example.com/public"))
        self.assertFalse(policy.allowed("https://example.com/private"))

    def test_robots_server_failure_is_retryable_not_fail_open(self):
        fetcher = Mock()
        fetcher.fetch.return_value = FetchResult(
            "https://example.com/robots.txt", 503, {}, b""
        )
        with self.assertRaisesRegex(CrawlError, "robots_temporarily_unavailable"):
            RobotsPolicy(fetcher).allowed("https://example.com/")

    def test_per_domain_rate_limit(self):
        clock = Mock(side_effect=[0.0, 0.0, 0.25, 1.0])
        sleeper = Mock()
        limiter = DomainLimiter(1.0, clock, sleeper)
        limiter.wait("example.com")
        limiter.wait("example.com")
        sleeper.assert_called_once_with(0.75)


class JobTests(TestCase):
    def make_job(self, **kwargs):
        values = {
            "tenant_id": uuid.uuid4(),
            "campaign_id": uuid.uuid4(),
            "start_urls": [PUBLIC_URL],
            "idempotency_key_hash": uuid.uuid4().hex,
            "policy": {"max_pages": 1},
        }
        values.update(kwargs)
        return CrawlJob.objects.create(**values)

    def fetcher(
        self,
        body=b"<html><title>Example Co</title><body>hello@example.com</body></html>",
        content_type="text/html",
    ):
        fake = Mock()
        fake.fetch.return_value = FetchResult(
            PUBLIC_URL, 200, {"Content-Type": content_type}, body
        )
        return fake

    def test_idempotency_and_tenant_campaign_isolation(self):
        tenant, campaign = uuid.uuid4(), uuid.uuid4()
        one, created = create_job(
            tenant_id=tenant,
            campaign_id=campaign,
            start_urls=[PUBLIC_URL],
            idempotency_key="same-key",
        )
        two, created_again = create_job(
            tenant_id=tenant,
            campaign_id=campaign,
            start_urls=[PUBLIC_URL],
            idempotency_key="same-key",
        )
        other, _ = create_job(
            tenant_id=uuid.uuid4(),
            campaign_id=campaign,
            start_urls=[PUBLIC_URL],
            idempotency_key="same-key",
        )
        self.assertTrue(created)
        self.assertFalse(created_again)
        self.assertEqual(one.pk, two.pk)
        self.assertNotEqual(one.pk, other.pk)

    def test_database_backed_rate_limit(self):
        current = timezone.now()
        clock = Mock(return_value=current)
        sleeper = Mock()
        limiter = DatabaseDomainLimiter(2.0, clock, sleeper)
        limiter.wait("example.com")
        limiter.wait("example.com")
        sleeper.assert_called_once_with(2.0)

    def test_page_count_depth_and_extraction(self):
        body = b'<html><title>Example Co</title><a href="/two">two</a><a href="/three">three</a></html>'
        job = self.make_job(policy={"max_pages": 2, "max_depth": 1})
        process_job(
            job,
            self.fetcher(body),
            robots=Mock(allowed=Mock(return_value=True)),
            limiter=Mock(),
        )
        self.assertLessEqual(job.pages.count(), 2)
        self.assertEqual(LeadCandidate.objects.filter(job=job).count(), 1)

    def test_content_type_executable_and_size_rejection(self):
        for content_type in ("application/x-msdownload", "application/pdf"):
            job = self.make_job(idempotency_key_hash=uuid.uuid4().hex)
            process_job(
                job,
                self.fetcher(b"MZ", content_type),
                robots=Mock(allowed=Mock(return_value=True)),
                limiter=Mock(),
            )
            self.assertEqual(
                job.pages.get().rejection_reason, "unsupported_content_type"
            )
        job = self.make_job(idempotency_key_hash=uuid.uuid4().hex)
        fetcher = Mock()
        fetcher.fetch.side_effect = CrawlError("response_too_large")
        process_job(
            job, fetcher, robots=Mock(allowed=Mock(return_value=True)), limiter=Mock()
        )
        self.assertEqual(job.pages.get().rejection_reason, "response_too_large")

    def test_timeout_retry_and_dead_letter(self):
        job = self.make_job(max_attempts=2)
        fetcher = Mock()
        fetcher.fetch.side_effect = CrawlError(
            "network_timeout_or_error", retryable=True
        )
        with self.assertRaises(CrawlError):
            process_job(
                job,
                fetcher,
                robots=Mock(allowed=Mock(return_value=True)),
                limiter=Mock(),
            )
        job.refresh_from_db()
        self.assertEqual(job.state, CrawlJob.State.RETRY_WAIT)
        job.state = CrawlJob.State.QUEUED
        job.save()
        with self.assertRaises(CrawlError):
            process_job(
                job,
                fetcher,
                robots=Mock(allowed=Mock(return_value=True)),
                limiter=Mock(),
            )
        job.refresh_from_db()
        self.assertEqual(job.state, CrawlJob.State.DEAD_LETTER)

    def test_cancellation(self):
        job = self.make_job(cancel_requested_at=timezone.now())
        process_job(job, self.fetcher(), robots=Mock(), limiter=Mock())
        job.refresh_from_db()
        self.assertEqual(job.state, CrawlJob.State.CANCELLED)

    def test_lease_expiry_and_crash_recovery(self):
        expired = self.make_job(
            state=CrawlJob.State.LEASED,
            lease_owner="crashed",
            lease_expires_at=timezone.now() - timedelta(seconds=1),
        )
        claimed = claim_job("replacement", 30)
        self.assertEqual(claimed.pk, expired.pk)
        self.assertEqual(claimed.lease_owner, "replacement")

    def test_zero_external_system_writes(self):
        self.assertFalse(settings.SCRAPER_MIDDLEWARE_DELIVERY_ENABLED)
        self.assertFalse(settings.SCRAPER_ODOO_WRITES_ENABLED)
        self.assertFalse(settings.SCRAPER_VICIDIAL_WRITES_ENABLED)
        self.assertFalse(settings.SCRAPER_N8N_WRITES_ENABLED)
        self.assertFalse(settings.SCRAPER_POSTLY_WRITES_ENABLED)
        self.assertFalse(settings.SCRAPER_OUTREACH_WRITES_ENABLED)
