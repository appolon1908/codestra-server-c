# Controlled public-web crawler

The Server C crawler discovers lead candidates from unauthenticated public HTTP/HTTPS pages only. It never logs in, bypasses CAPTCHA, sends outreach, or treats public data as consent. `SCRAPER_WORKER_ENABLED` defaults to false; operators run `python manage.py run_scraper_worker` only in an approved isolated runtime.

Jobs are submitted at `POST /api/v1/scraper/jobs`, inspected at `GET /api/v1/scraper/jobs/{job_id}`, and cancelled at `POST /api/v1/scraper/jobs/{job_id}/cancel`. All routes require an authenticated admin. Baseline operation has no paid-provider dependency.

Limits are bounded by request validation: depth 0–3, pages 1–100, response 1 KiB–5 MiB, timeout 1–30 seconds, redirects 0–8, and per-domain delay 0.1–60 seconds. Defaults are depth 2, 25 pages, 2 MiB, 10 seconds, five redirects, and one second.

Each accepted page records its final URL, status, MIME type, retrieval timestamp, content hash, depth, and rejection reason when applicable. Extraction preserves evidence and confidence; it does not synthesize missing contact details. Retryable transport and robots failures use bounded attempts, while permanent safety and content rejections remain explicit evidence rather than silent success.
