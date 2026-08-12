from __future__ import annotations

import hashlib
import hmac
import random
from dataclasses import dataclass
from datetime import timedelta
from email.utils import parsedate_to_datetime

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import ScraperDeliveryAttempt, ScraperOutboxEvent
from .outbox import canonical_json, claim_event


class DeliveryConfigurationError(RuntimeError):
    pass


@dataclass(frozen=True)
class DeliveryResult:
    outcome: str
    status: int | None = None
    acknowledgement: str = ""
    retry_after: float | None = None
    error_class: str = ""


def require_contract() -> None:
    required = {
        "SCRAPER_DELIVERY_URL": settings.SCRAPER_DELIVERY_URL,
        "SCRAPER_DELIVERY_SCHEMA_CHECKSUM": settings.SCRAPER_DELIVERY_SCHEMA_CHECKSUM,
        "SCRAPER_DELIVERY_HMAC_KEY_ID": settings.SCRAPER_DELIVERY_HMAC_KEY_ID,
        "SCRAPER_DELIVERY_HMAC_SECRET": settings.SCRAPER_DELIVERY_HMAC_SECRET,
        "SCRAPER_DELIVERY_BEARER_TOKEN": settings.SCRAPER_DELIVERY_BEARER_TOKEN,
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise DeliveryConfigurationError(
            "missing_delivery_contract:" + ",".join(missing)
        )
    if not settings.SCRAPER_DELIVERY_URL.startswith("https://"):
        raise DeliveryConfigurationError("https_delivery_url_required")


def signature(secret: str, timestamp: str, event_id: str, body: bytes) -> str:
    body_hash = hashlib.sha256(body).hexdigest()
    canonical = f"{timestamp}\n{event_id}\n{body_hash}".encode()
    return "sha256=" + hmac.new(secret.encode(), canonical, hashlib.sha256).hexdigest()


def parse_retry_after(value: str | None, now=None) -> float | None:
    if not value:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        try:
            current = now or timezone.now()
            parsed = parsedate_to_datetime(value)
            return max(0.0, (parsed - current).total_seconds())
        except (TypeError, ValueError, OverflowError):
            return None


def send_event(event: ScraperOutboxEvent, session=requests) -> DeliveryResult:
    require_contract()
    if event.schema_checksum != settings.SCRAPER_DELIVERY_SCHEMA_CHECKSUM:
        return DeliveryResult(
            "permanent_failure", error_class="schema_checksum_mismatch"
        )
    body = canonical_json(event.payload)
    if hashlib.sha256(body).hexdigest() != event.payload_hash:
        return DeliveryResult("permanent_failure", error_class="payload_hash_mismatch")
    timestamp = str(int(timezone.now().timestamp()))
    headers = {
        "Authorization": f"Bearer {settings.SCRAPER_DELIVERY_BEARER_TOKEN}",
        "Content-Type": "application/json",
        "Idempotency-Key": event.idempotency_key,
        "X-Codestra-Event-ID": str(event.event_id),
        "X-Codestra-Key-ID": settings.SCRAPER_DELIVERY_HMAC_KEY_ID,
        "X-Codestra-Timestamp": timestamp,
        "X-Codestra-Signature": signature(
            settings.SCRAPER_DELIVERY_HMAC_SECRET, timestamp, str(event.event_id), body
        ),
        "X-Correlation-ID": str(event.correlation_id),
    }
    try:
        response = session.post(
            settings.SCRAPER_DELIVERY_URL,
            data=body,
            headers=headers,
            timeout=(
                settings.SCRAPER_DELIVERY_CONNECT_TIMEOUT,
                settings.SCRAPER_DELIVERY_READ_TIMEOUT,
            ),
            verify=settings.SCRAPER_DELIVERY_CA_BUNDLE or True,
            cert=settings.SCRAPER_DELIVERY_CLIENT_CERT or None,
        )
    except (
        requests.Timeout,
        requests.ConnectionError,
        requests.exceptions.SSLError,
    ) as exc:
        return DeliveryResult("retry", error_class=type(exc).__name__)
    if response.status_code in settings.SCRAPER_DELIVERY_ACCEPTED_STATUSES:
        try:
            acknowledgement = str(response.json()[settings.SCRAPER_DELIVERY_ACK_FIELD])[
                :200
            ]
        except (ValueError, KeyError, TypeError):
            return DeliveryResult(
                "retry",
                status=response.status_code,
                error_class="invalid_acknowledgement",
            )
        return DeliveryResult(
            "delivered", status=response.status_code, acknowledgement=acknowledgement
        )
    if response.status_code == 429 or response.status_code >= 500:
        return DeliveryResult(
            "retry",
            status=response.status_code,
            retry_after=parse_retry_after(response.headers.get("Retry-After")),
        )
    return DeliveryResult(
        "permanent_failure",
        status=response.status_code,
        error_class=f"http_{response.status_code}",
    )


def complete_attempt(
    event: ScraperOutboxEvent, result: DeliveryResult, jitter=random.uniform
) -> None:
    now = timezone.now()
    with transaction.atomic():
        locked = ScraperOutboxEvent.objects.select_for_update().get(pk=event.pk)
        locked.attempt_count += 1
        ScraperDeliveryAttempt.objects.create(
            event=locked,
            attempt_number=locked.attempt_count,
            correlation_id=locked.correlation_id,
            outcome=result.outcome,
            response_status=result.status,
            error_class=result.error_class,
            payload_hash=locked.payload_hash,
            started_at=now,
            completed_at=timezone.now(),
        )
        locked.lease_owner = None
        locked.lease_expires_at = None
        if result.outcome == "delivered":
            locked.state = ScraperOutboxEvent.State.DELIVERED
            locked.delivered_at = now
            locked.acknowledgement_reference = result.acknowledgement
            locked.last_error_class = ""
        elif (
            result.outcome == "permanent_failure"
            or locked.attempt_count >= locked.max_attempts
        ):
            locked.state = ScraperOutboxEvent.State.DEAD_LETTER
            locked.last_error_class = result.error_class or "attempt_limit"
        else:
            locked.state = ScraperOutboxEvent.State.RETRY_WAIT
            base = min(settings.SCRAPER_DELIVERY_MAX_BACKOFF, 2**locked.attempt_count)
            delay = (
                result.retry_after
                if result.retry_after is not None
                else base + jitter(0, base * 0.25)
            )
            locked.next_attempt_at = now + timedelta(seconds=delay)
            locked.last_error_class = result.error_class
        locked.save()


def deliver_once(owner: str) -> bool:
    if not settings.SCRAPER_MIDDLEWARE_DELIVERY_ENABLED:
        return False
    event = claim_event(owner, settings.SCRAPER_DELIVERY_LEASE_SECONDS)
    if event is None:
        return False
    complete_attempt(event, send_event(event))
    return True
