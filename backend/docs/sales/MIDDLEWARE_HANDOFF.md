# Phase 2 Middleware handoff

Phase 1 performs zero Middleware delivery. `SCRAPER_MIDDLEWARE_DELIVERY_ENABLED` is hard-coded false, and the worker has no Middleware client or credential mount.

Phase 2 requires a separately reviewed authenticated private endpoint, tenant/campaign authorization, signed idempotent delivery, schema compatibility for `lead-candidate.v1`, consent/suppression governance, retry and unknown-result reconciliation, audit retention, metrics, and a deployment approval. Odoo, VICIdial, n8n, Postly, and outreach systems must remain behind Middleware and must never be called directly by Server C.

Required acceptance evidence includes mutual endpoint ownership, secret rotation and storage, request signing and replay bounds, per-tenant authorization, duplicate delivery tests, timeout/unknown-result reconciliation, dead-letter ownership, payload retention rules, and dashboards for accepted/rejected/replayed deliveries. Delivery must remain fail closed until all prerequisites pass.

Phase 1 counters are: Middleware writes `0`, Odoo writes `0`, VICIdial writes `0`, n8n writes `0`, Postly writes `0`, and outreach/campaign writes `0`.
