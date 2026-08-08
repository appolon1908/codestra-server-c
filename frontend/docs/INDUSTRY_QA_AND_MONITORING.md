# Industry Canary QA and Monitoring

## Public API contracts

- `POST /api/v1/leads`
- `POST /api/v1/demo-requests`
- `POST /api/v1/pricing-requests`
- `POST /api/v1/contact-requests`
- `POST /api/v1/analytics/events`
- `POST /api/v1/analytics/events/batch`
- `GET /api/v1/public/industries`
- `GET /api/v1/public/industries/:industry`
- `GET /api/v1/public/availability`

The four conversion endpoints share one validated, rate-limited, consent-protected, honeypot-protected, idempotent submission contract. This is intentional: each route expresses conversion intent while using one delivery boundary.

## Health and monitoring

- `GET /health/live`: process availability.
- `GET /health/ready`: database readiness.
- `GET /.well-known/codestra-service`: non-secret service manifest.
- `GET /metrics`: staff-authenticated aggregate counts; no personal data appears in labels or values.

Alert definitions for the canary: availability below 99.9%, elevated 5xx rate, p95 API latency above 1.5 seconds, queue growth for 15 minutes, delivery failure above 5%, any dead-letter item, and sustained form-validation increase above baseline. Odoo delivery alerts remain dormant in mock mode.

## Privacy

Analytics receives anonymous session ID, time, page, CTA, section, attribution, device category, language, and consent state. It must not receive names, emails, telephone numbers, transcripts, freight details, uploaded documents, or calculator financial inputs.

## Evidence

Automated checks cover responsive layouts, keyboard navigation, scenario selection, calculator updates, contextual CTA routing, attribution, canonical submissions, duplicate-click prevention, server errors, accessibility, and cross-browser form behavior. Visual screenshots are stored under `output/industry-canary/` after the final production capture.
