# Scraper architecture

`CrawlJob` is the PostgreSQL-backed queue. Workers atomically claim eligible rows with `SELECT FOR UPDATE SKIP LOCKED`, record an owner and expiry, and reclaim expired leases after crashes. Terminal states are `COMPLETED`, `CANCELLED`, and `DEAD_LETTER`; retryable network failures use bounded exponential delay and a maximum attempt count.

The worker validates DNS and every redirect, pins the validated address for the connection, rechecks DNS to detect rebinding, evaluates robots.txt, applies a per-domain delay, and bounds bytes before parsing. `CrawlPage` stores page-level provenance. `LeadCandidate` stores the versioned contract and is idempotent within tenant and campaign.

Provider adapters are an optional boundary. Hunter, Apollo, Twilio, OpenCorporates, and OpenAI are registered as disabled adapters and are not required or invoked by the crawler.

The API is an authenticated administrative control plane. It creates tenant/campaign-scoped jobs with a hashed idempotency key, reports job state, and requests cancellation. It does not expose a generic fetch proxy. The data path is `CrawlJob → worker → validated public fetch → CrawlPage → LeadCandidate`; there is no downstream delivery edge in Phase 1.

Parsing is intentionally bounded and non-executing: HTML text/links plus JSON-LD Schema.org objects. No browser automation or JavaScript execution occurs. Structured contact identity is accepted only when public evidence explicitly supports it.
