# Scraper operations

Queue lifecycle: `QUEUED → LEASED → RUNNING → COMPLETED`. Cancellation produces `CANCELLED`. Retryable failures produce `RETRY_WAIT`; exhausted jobs become `DEAD_LETTER`. Expired leases are claimable by another worker.

Recovery: stop workers, inspect job/page rejection codes without exposing page content, correct infrastructure, and explicitly requeue only understood retryable failures. Rollback disables workers, reverts the migration/code, and retains database evidence until retention policy permits deletion. Do not retry uncertain downstream writes because no downstream delivery exists in Phase 1.

## Operation and monitoring

Run `python manage.py run_scraper_worker --once` for a controlled queue cycle. A continuously running worker requires both the feature flag and an approved isolated service definition. Alert on increasing oldest-queued age, expired leases, retry rate, dead-letter count, robots failures, DNS/SSRF rejections, provider-adapter calls (expected zero), and worker exits. Metrics and logs must use job IDs and rejection codes, never page bodies or extracted personal data as labels.

Cancellation is cooperative and checked before each queued page. A worker crash leaves its lease to expire; another worker can reclaim it. Operators must not manually clear leases that may still be active. Dead-letter jobs require root-cause review and a new idempotent job or an explicitly audited requeue procedure.

## Rollback

1. Set `SCRAPER_WORKER_ENABLED=false` and stop crawler workers.
2. Confirm there are no active leases; allow live leases to expire rather than deleting them.
3. Revert application code and routing.
4. Reverse `sales_scraper` migrations only when governance allows removal of stored evidence; otherwise leave tables dormant.
5. Verify all external-write counters remain zero.

No production deployment or Phase 2 delivery is part of this release.
