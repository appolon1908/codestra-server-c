import hashlib
import hmac
import json
import uuid

import requests
from django.conf import settings


class GatewayUnavailable(RuntimeError):
    pass


def hash_idempotency(value):
    return hashlib.sha256(value.encode()).hexdigest()


def dispatch(path, payload, headers):
    if not settings.MIDDLEWARE_GATEWAY_URL:
        raise GatewayUnavailable("middleware_gateway_not_configured")
    safe_headers = {
        "Authorization": headers.get("Authorization", ""),
        "Idempotency-Key": headers["Idempotency-Key"],
        "X-Tenant-ID": headers["X-Tenant-ID"],
        "X-Workspace-ID": headers["X-Workspace-ID"],
        "X-Audit-Context": headers.get("X-Audit-Context", "{}"),
        "Content-Type": "application/json",
        # Keep one correlation identifier across Server C, the middleware
        # gateway and any downstream audit/outbox records.  Never log or
        # forward browser credentials here.
        "X-Request-ID": headers.get("X-Request-ID") or str(uuid.uuid4()),
    }
    try:
        response = requests.post(
            f"{settings.MIDDLEWARE_GATEWAY_URL.rstrip('/')}/{path.lstrip('/')}",
            data=json.dumps(payload, separators=(",", ":"), ensure_ascii=False),
            headers=safe_headers, timeout=settings.MIDDLEWARE_GATEWAY_TIMEOUT,
            allow_redirects=False,
        )
    except requests.RequestException as exc:
        raise GatewayUnavailable("middleware_gateway_unreachable") from exc
    if response.status_code >= 500:
        raise GatewayUnavailable("middleware_gateway_failure")
    return response


def response_payload(response):
    """Decode a gateway response without leaking upstream HTML/details."""
    if not response.content:
        return {"accepted": response.ok}
    try:
        body = response.json()
    except (ValueError, TypeError):
        return {"accepted": response.ok}
    return body if isinstance(body, (dict, list)) else {"accepted": response.ok}


def constant_time_checksum(expected, actual):
    return bool(expected) and hmac.compare_digest(expected.lower(), actual.lower())
