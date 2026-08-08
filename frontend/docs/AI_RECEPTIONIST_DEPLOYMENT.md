# Build and deployment

Frontend: copy `.env.example`, provide public phone/site values, leave `VITE_API_ENDPOINT` empty for same-origin production, then run `npm ci`, `npm test`, `npm run lint`, `npm run build`, and `npm run test:e2e`.

Backend: copy `.env.example`, retain `LEAD_DELIVERY_MODE=mock`, run migrations and the `lead_capture` tests, then deploy web and Celery from the same image. Do not activate Odoo until staging mapping and failure-flow tests pass and production writes are explicitly approved.

The sample audio is a placeholder reference in the UI. Replace it with an approved local recording and keep the visible placeholder disclosure until that review is complete.
