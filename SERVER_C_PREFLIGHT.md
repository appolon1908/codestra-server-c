# Server C preflight (staging)

Captured 2026-08-05 from the host currently available to Codex.

## Access

- SSH daemon is listening on TCP/22.
- `/root/.ssh/authorized_keys` contains the dedicated public key named
  `codestra-codex-server-c-49.12.145.107`.
- The matching private key is not present in `/root/.ssh`; the available keys
  are middleware-operator and Postiz keys and do not match it.
- No SSH config/known-host entry identifies Server C. Access is therefore not
  claimed as restored; an operator must provision the matching private key and
  verify the host fingerprint before remote changes.

## Local deployed-source candidates

- `/root/server-c-book-c-edit/backend` — Django Server C CMS/portal boundary.
- `/root/server-c-book-c-edit/frontend` — React/Vite public website/portal.
- This tree has no Git metadata, so its source revision cannot be asserted.
- The currently running Docker Compose project is `/root/github-projects/backend`
  (trading backend), not this Server C tree. The public staging URL currently
  serves the trading frontend. No Server C deployment was restarted.

## Safety gates

- `DIRECT_ODOO_WRITES_ENABLED=false`.
- `DIRECT_VICIDIAL_WRITES_ENABLED=false`.
- Marketplace installation/production activation is disabled.
- Autonomous outreach/email/SMS/social messaging is disabled.
- Public forms and scraper/sales mutations fail closed when middleware is not
  configured; no fake success response is generated.

## Verification performed

- Backend image build: `codestra-server-c-check:staging` passed.
- `python manage.py check` passed in the built image.
- Frontend image build: `codestra-server-c-frontend-check:staging` passed.
- Frontend lint passed.
- Frontend Vitest: 3 files / 8 tests passed.
- Python bytecode compilation passed.
- A temporary Postgres-backed test run reached the full Server C/lead-capture
  suite but was interrupted after an environment-dependent Celery/Redis
  visitor-tracking failure; it is not reported as a green backend suite.
