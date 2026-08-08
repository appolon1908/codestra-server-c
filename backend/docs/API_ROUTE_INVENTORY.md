# Server C API and integration inventory

This inventory is generated from `CORE/urls.py`, `server_c/urls.py`,
`lead_capture/urls.py`, and `lead_capture/internal_urls.py`. It describes the
boundary owned by Server C; it does not claim undocumented behavior for the
middleware gateway.

## Public API (`/api/v1`)

| Method | Route | Purpose | External side effect |
|---|---|---|---|
| GET | `/api/v1/marketplace/categories` | Visible marketplace categories | none |
| GET | `/api/v1/marketplace/publishers` | Visible publishers | none |
| GET | `/api/v1/marketplace/products` | Paginated visible catalog | none |
| GET | `/api/v1/marketplace/search` | Filtered visible catalog search | none |
| GET | `/api/v1/marketplace/products/{product_code}` | Visible product detail | none |
| GET | `/api/v1/marketplace/health` | Public marketplace status | none |
| POST | `/api/v1/marketplace/trial-requests` | Validated tenant command | middleware only |
| POST | `/api/v1/marketplace/installation-requests` | Installation command | middleware only |
| POST | `/api/v1/marketplace/update-requests` | Update command | middleware only |
| POST | `/api/v1/marketplace/rollback-requests` | Rollback command | middleware only |
| POST | `/api/v1/sales/discovery` | Bounded public discovery request | middleware worker only |
| POST | `/api/v1/sales/enrichment` | Enrichment command | middleware only |
| POST | `/api/v1/sales/validation` | Lead validation command | middleware only |
| POST | `/api/v1/sales/research` | Research command | middleware/AI boundary only |
| POST | `/api/v1/sales/scoring` | Lead scoring command | middleware only |
| GET | `/api/v1/sales/companies` | Tenant/workspace-scoped companies | none |
| GET | `/api/v1/sales/contacts` | Tenant/workspace-scoped contacts | none |
| GET | `/api/v1/sales/prospect-lists` | Tenant/workspace-scoped lists | none |
| POST | `/api/v1/sales/crm-submission-requests` | Validated prospect handoff | middleware only |
| GET | `/api/v1/sales/health` | Public sales status | none |
| GET | `/api/v1/public/site-config` | Public feature/config summary | none |
| GET | `/api/v1/public/navigation` | Public navigation | none |
| GET | `/api/v1/public/status` | Public service status | none |
| POST | `/api/v1/public/{contact,demo-request,trial-request,partner-application,developer-application,support-request}` | Validated public form | middleware only |
| POST | `/api/v1/leads`, `/api/v1/demo-requests`, `/api/v1/pricing-requests`, `/api/v1/contact-requests` | Lead capture | local queue; configured adapter |
| POST | `/api/v1/analytics/events` | Privacy-safe analytics event | local only |
| POST | `/api/v1/analytics/events/batch` | Batch analytics events | local only |
| GET | `/api/v1/public/industries` and `/{industry}` | Industry catalog | none |
| GET | `/api/v1/public/availability` | Safe capability summary | none |
| GET | `/api/v1/public/integrations` | Integration availability | none |
| GET | `/api/v1/public/demo-scenarios/{industry}` | Simulated scenario catalog | none |
| POST | `/api/v1/consent` | Consent acknowledgement | local cookie/response |
| POST | `/api/v1/roi-calculations` | Pure calculation | none |
| GET | `/api/v1/localization/{config,country,messages/{locale}}` | Localization data | none |
| POST | `/api/v1/localization/preference` | Locale cookie | local cookie |

## Internal service boundary (`/internal/v1`)

`X-Service-ID`, `X-Timestamp`, `X-Signature`, freshness and replay checks are
required. The reverse proxy must not publish these routes.

- `/internal/v1/odoo/leads` and `/internal/v1/odoo/delivery/{submission_id}`
- `/internal/v1/odoo/delivery/retry`
- `/internal/v1/odoo/reconciliation/run`
- `/internal/v1/odoo/reconciliation/failures`
- `/internal/v1/odoo/activities`, `/odoo/attribution`
- `/internal/v1/n8n/events`, `/internal/v1/notifications/dispatch`

These endpoints enqueue or report work. Direct Odoo/VICIdial writes remain
disabled by `DIRECT_ODOO_WRITES_ENABLED=false` and
`DIRECT_VICIDIAL_WRITES_ENABLED=false`. Server C does not expose VICIdial
write endpoints.

## Webhook boundary

Webhook subscription management is owned by the existing payment integration:
`/api/payment/subscriptions/`, `/api/payment/subscriptions/{id}/`,
`/api/payment/subscriptions/{id}/test/`, and `/api/payment/deliveries/`.
Delivery uses `X-Codestra-Event-Id` and timestamped HMAC signatures. The
staging receiver is `/api/payment/staging-receiver/` and must remain disabled
unless `WEBHOOK_STAGING_MODE=true`.

## Middleware contract

Authenticated mutations require `Authorization`, `Idempotency-Key`,
`X-Tenant-ID`, `X-Workspace-ID`, and optional `X-Audit-Context`. Server C sends
these to the configured `MIDDLEWARE_GATEWAY_URL` (staging gateway documented as
`65.109.65.169`) with an `X-Request-ID`. Server C never provisions packages,
writes Odoo/VICIdial directly, or enables production activation.
