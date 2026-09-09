# Controlled public-web crawler

The Server C crawler discovers lead candidates from unauthenticated public HTTP/HTTPS pages only. It never logs in, bypasses CAPTCHA, sends outreach, or treats public data as consent. `SCRAPER_WORKER_ENABLED` defaults to false; operators run `python manage.py run_scraper_worker` only in an approved isolated runtime.

Jobs are submitted at `POST /v1/scraper/jobs`, inspected at `GET /v1/scraper/jobs/{job_id}`, read separately at `GET /v1/scraper/jobs/{job_id}/results`, and cancelled with `DELETE /v1/scraper/jobs/{job_id}`. All routes require an authenticated principal with an active server-side tenant mapping. Baseline operation has no paid-provider dependency. The legacy `/api/v1` and `/cancel` paths remain private compatibility aliases.

Limits are bounded by request validation: depth 0–3, pages 1–100, response 1 KiB–5 MiB, total duration 1–900 seconds, request timeout 1–30 seconds, redirects 0–8, retries 0–5, and per-domain delay 0.1–60 seconds. Defaults are depth 2, 25 pages, 2 MiB, 300 seconds total, 10 seconds per request, two retries, five redirects, and one second. Server configuration also caps global/tenant concurrency and tenant hourly/daily creation quotas.

Each accepted page records its final URL, status, MIME type, retrieval timestamp, content hash, depth, and rejection reason when applicable. Extraction preserves evidence and confidence; it does not synthesize missing contact details. Retryable transport and robots failures use bounded attempts, while permanent safety and content rejections remain explicit evidence rather than silent success.


## Legacy upgrade and admission certification

The 0003 upgrade now backfills canonical payload hashes before narrowing idempotency uniqueness. Legacy cross-campaign collisions retain every job: the earliest job keeps its internal key, and subsequent collisions receive deterministic internal keys. Original key hashes are retained as server-only policy aliases. Exact legacy payload replays return their original jobs; unmatched payloads remain conflicts and never create a new job. Reversing 0003 restores original key hashes after restoring the old campaign-scoped constraint. Take and certify a full database backup before any production migration.

Migration 0004 also repairs databases that already applied the original 0003 and seeds a single admission-lock row. API admission locks that row before quota checks and insertion, serializing global and per-tenant limits across different principals. A missing lock fails closed with HTTP 503. PostgreSQL concurrency regression tests must pass; SQLite cannot certify row locking. Crawler and delivery workers remain disabled by default.

This source change is not deployment authorization. Production migration requires reviewed release authority, backup/rollback certification, isolated restore and pre-cutover health evidence.
