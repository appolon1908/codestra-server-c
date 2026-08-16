# Controlled crawler API

The production crawler control plane is private. Kong authenticates the customer,
Middleware maps that identity to a dedicated service principal, and the scraper
derives the tenant from its server-side `ScraperTenantPrincipal` mapping. It must
not be exposed directly to the public Internet. Customer-supplied `tenant_id`
and body-supplied idempotency keys are rejected.

## Health and discovery

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz/` | Container liveness |
| `GET` | `/health/live` | Service liveness |
| `GET` | `/health/ready` | Dependency readiness |
| `GET` | `/.well-known/codestra-service` | Service manifest |
| `GET` | `/metrics` | Private monitoring scrape |

## Authenticated control plane

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/scraper/jobs` | Submit an idempotent, tenant-scoped job |
| `GET` | `/v1/scraper/jobs/{job_id}` | Read bounded job state only |
| `GET` | `/v1/scraper/jobs/{job_id}/results` | Read authoritative paginated results |
| `DELETE` | `/v1/scraper/jobs/{job_id}` | Request bounded cancellation |

Creation requires an `Idempotency-Key` header. The same tenant, key, and
canonical payload return the original job. Reuse with a different payload
returns HTTP 409. All status, results, and cancellation lookups include the
server-derived tenant and return 404 for another tenant's identifier.

The only accepted extraction profile is `public-company-contact-v1`; callers
cannot upload JavaScript, Playwright programs, selectors, or executable code.

Required safe-start flags:

```text
SCRAPER_WORKER_ENABLED=false
SCRAPER_PUBLIC_CRAWL_ENABLED=false
SCRAPER_TO_MIDDLEWARE_DELIVERY_ENABLED=false
SCRAPER_MIDDLEWARE_DELIVERY_ENABLED=false
MIDDLEWARE_DELIVERY_MODE=dry_run
WORKER_COUNT=0
GENERAL_CAMPAIGNS_ENABLED=false
OUTREACH_ENABLED=false
ODOO_WRITE_ENABLED=false
VICIDIAL_WRITE_ENABLED=false
N8N_WRITE_ENABLED=false
POSTLY_WRITE_ENABLED=false
```

No crawler job may execute while workers are disabled. Middleware delivery is
reported as disabled in the job-creation response and remains a separate gate.
