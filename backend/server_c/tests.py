import socket
import uuid
from unittest.mock import patch, Mock

from django.test import SimpleTestCase
from rest_framework.test import APIClient, APITestCase
from django.test import override_settings

from .security import UnsafeTarget, validate_public_url


class ScraperSecurityTests(SimpleTestCase):
    def resolver(self, address):
        return lambda *args, **kwargs: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (address, 443))]

    def test_private_and_metadata_addresses_are_blocked(self):
        for address in ("127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.2", "169.254.169.254"):
            with self.assertRaises(UnsafeTarget): validate_public_url("https://example.com", resolver=self.resolver(address))

    def test_public_address_is_allowed(self):
        self.assertEqual(validate_public_url("https://example.com", resolver=self.resolver("93.184.216.34")), "https://example.com")


@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
class BoundaryTests(APITestCase):
    def setUp(self): self.client = APIClient()

    def test_marketplace_mutation_requires_context(self):
        response = self.client.post("/api/v1/marketplace/installation-requests", {}, format="json")
        self.assertIn(response.status_code, (400, 401, 403))

    def test_public_form_fails_closed_without_middleware(self):
        payload = {"form_id": "contact", "form_version": "1", "submission_id": str(uuid.uuid4()), "timestamp": "2026-08-05T00:00:00Z", "source_page": "/", "consent_state": "granted", "privacy_policy_version": "1", "idempotency_key": str(uuid.uuid4())}
        response = self.client.post("/api/v1/public/contact", payload, format="json")
        self.assertEqual(response.status_code, 503)

    def test_honeypot_rejected(self):
        response = self.client.post("/api/v1/public/contact", {"website": "bot"}, format="json")
        self.assertEqual(response.status_code, 400)

    @override_settings(SERVER_C_FEATURE_FLAGS={"SCRAPER_STAGING_ENABLED": False})
    def test_scraper_feature_gate_fails_closed(self):
        response = self.client.post("/api/v1/sales/discovery", {}, format="json")
        self.assertEqual(response.status_code, 401)

    @patch("server_c.gateway.requests.post")
    @override_settings(MIDDLEWARE_GATEWAY_URL="https://middleware.example", MIDDLEWARE_GATEWAY_TIMEOUT=2)
    def test_gateway_adds_correlation_id_and_disables_redirects(self, post):
        post.return_value = Mock(status_code=202, ok=True, content=b'{"accepted":true}', json=lambda: {"accepted": True})
        from .gateway import dispatch
        response = dispatch("api/v1/sales/validation", {"job": "x"}, {
            "Authorization": "Bearer test",
            "Idempotency-Key": "idem-1",
            "X-Tenant-ID": str(uuid.uuid4()),
            "X-Workspace-ID": str(uuid.uuid4()),
        })
        self.assertEqual(response.status_code, 202)
        kwargs = post.call_args.kwargs
        self.assertTrue(kwargs["headers"]["X-Request-ID"])
        self.assertFalse(kwargs["allow_redirects"])
        self.assertEqual(kwargs["timeout"], 2)
