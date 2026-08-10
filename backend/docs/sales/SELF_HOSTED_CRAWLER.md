# Self-hosted crawler

Required baseline variables are the normal Django/PostgreSQL settings. Optional worker controls are `SCRAPER_WORKER_ENABLED` and `SCRAPER_LEASE_SECONDS`; the worker remains disabled by default. Start one worker with `python manage.py run_scraper_worker` or perform a controlled cycle using `--once`.

Use low concurrency, monitor queue age, retry/dead-letter counts, robots denials, DNS rejections, response-size rejections, and extraction confidence. Never mount Middleware, Odoo, VICIdial, n8n, Postly, outreach, or provider credentials into this worker.

## Runtime configuration

- `SCRAPER_WORKER_ENABLED=false` is the deployment feature flag. The management command exits unless it is true.
- `SCRAPER_LEASE_SECONDS=60` controls claim lifetime; choose a value longer than normal single-page processing and monitor expirations.
- Per-job policy controls depth, page count, bytes, timeout, redirects, retries, and domain delay within serializer-enforced ceilings.
- Hunter, Apollo, Twilio, OpenCorporates, and OpenAI adapters are optional interfaces. Baseline crawling neither configures nor invokes them.

Scale workers conservatively. Domain delay is coordinated in PostgreSQL, but total database capacity, job age, and target-site load remain operator responsibilities. The crawler is not a browser, does not execute JavaScript, does not solve CAPTCHA, and does not crawl authenticated material.
