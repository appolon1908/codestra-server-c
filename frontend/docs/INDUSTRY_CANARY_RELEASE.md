# Codestra Industry AI — Logistics Canary

## Scope

The first controlled release includes `/industries`, `/industries/logistics-ai`, `/book-demo`, and `/request-pricing`. Logistics is the only canary marked available. The other nine industries are labeled planned and link to discovery rather than presenting unsupported workflows.

## Architecture and design

- React 19, TypeScript, Vite, React Router, React Hook Form, Vitest, and Playwright.
- Existing Codestra header, footer, Sora typography, logo, dark surfaces, restrained yellow selection/CTA treatment, 1280px container system, and shared AI Receptionist controls.
- Industry content is stored in typed configuration at `src/Pages/Industries/industryConfig.ts`.
- The shared industry renderer provides scenario switching, workflow, integrations, opportunity calculator, security controls, sample analytics, FAQ, implementation, conversion CTAs, and a dismissible mobile conversion bar.

## Routes and CTA map

| Route | Purpose | Primary CTA | Context |
| --- | --- | --- | --- |
| `/industries` | Industry directory | Explore Logistics AI | directory |
| `/industries/logistics-ai` | Logistics canary | Book a Demo | `LOGISTICS_AI` |
| `/book-demo` | Demo conversion | Book a Live Demo | industry query parameter |
| `/request-pricing` | Pricing conversion | Request Pricing | industry query parameter |

All local navigation uses real routes or real section IDs. No placeholder `href="#"` controls are used.

## Campaign mapping

`LOGISTICS_AI` is carried in the landing URL and attribution context. Actual Odoo `campaign_id`, sales team, owner, priority, and SLA must be resolved server-side after staging approval. Numeric Odoo IDs must never enter frontend configuration.

Planned codes: `AI_RECEPTIONIST`, `LEGAL_AI`, `HEALTHCARE_AI`, `SENIOR_CARE_AI`, `REAL_ESTATE_AI`, `FINANCIAL_AI`, `ECOMMERCE_AI`, `HOSPITALITY_AI`, `CONSTRUCTION_AI`, and `AGRICULTURE_AI`.

## Controlled integration state

- `LEAD_DELIVERY_MODE=mock`
- `ODOO_FIELD_MAPPING_CONFIRMED=false`
- Demonstrations and dashboard values are labeled simulated/sample data.
- No telephone calls, messages, appointments, Odoo writes, VICIdial actions, or n8n workflows are activated.

## Deployment and rollback

Build immutable frontend and backend image tags, update `FRONTEND_IMAGE` and `BACKEND2_IMAGE`, then run the production Compose stack with health checks. Preserve the previous tags. Roll back by restoring both previous image values and running `docker compose up -d`; the lead-capture schema is backward-compatible and does not need a destructive rollback.

## Activation checklist

1. Confirm Odoo staging URL, database, OAuth/service credentials, and verified field mapping.
2. Create and verify campaign, source, medium, team, queue, priority, and SLA mappings.
3. Test success, timeout, invalid schema, duplicate, retry, dead-letter, reconciliation, and rollback.
4. Approve recording, retention, consent, human escalation, and restricted-action policies.
5. Authorize one canary workflow explicitly before changing delivery mode.
