# Scraper delivery contract

The crawler writes every new extracted candidate and its delivery event in one
database transaction. The delivery worker is independently disabled by default
and fails closed until the signed Server A ingress contract is configured.

Required contract settings are `SCRAPER_DELIVERY_URL`,
`SCRAPER_DELIVERY_SCHEMA_CHECKSUM`, `SCRAPER_DELIVERY_HMAC_KEY_ID`,
`SCRAPER_DELIVERY_HMAC_SECRET`, and `SCRAPER_DELIVERY_BEARER_TOKEN`. The URL must
use HTTPS. Optional client certificate and CA-bundle paths support the exact mTLS
requirements supplied by Server A. Secrets must be mounted at runtime and must
not be stored in Git or Compose files.

The HMAC canonical input is:

```text
TIMESTAMP\nEVENT_ID\nSHA256(CANONICAL_JSON_BODY)
```

The event ID and `scraper:<event_id>` idempotency key are stable. Only response
codes explicitly configured in `SCRAPER_DELIVERY_ACCEPTED_STATUSES` are treated
as success, and those responses must contain the configured acknowledgement
field. HTTP 429, documented server errors, timeouts, connection errors, and TLS
failures retry with bounded exponential backoff and jitter. Other responses are
dead-lettered as permanent failures. Every attempt stores a redacted immutable
ledger entry containing status, error class, correlation ID, and payload hash.

The worker never receives PostgreSQL, Redis, Odoo, n8n, VICIdial, social, email,
SMS, or outreach credentials for external systems. It communicates only with
the canonical HTTPS receiver.

Production activation requires the redacted Server A ingress contract and a
matching `SCRAPER_DELIVERY_CONTRACT_ACK`. Until then both crawling and delivery
remain disabled.
