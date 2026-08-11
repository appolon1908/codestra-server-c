# Controlled crawler API

The production crawler control plane is private and requires an authenticated
Django admin user for every job endpoint. It must not be exposed directly to
the public Internet.

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
| `POST` | `/api/v1/scraper/jobs` | Submit an idempotent, tenant/campaign-scoped job |
| `GET` | `/api/v1/scraper/jobs/{job_id}` | Read job state and synthetic candidates |
| `POST` | `/api/v1/scraper/jobs/{job_id}/cancel` | Request bounded cancellation |

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
