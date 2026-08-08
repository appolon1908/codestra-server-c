# Codestra frontend

React, TypeScript, and Vite frontend for the Codestra website and authenticated dashboard.

## Requirements

- Node.js 22
- npm 10 or newer
- An HTTPS API endpoint

## Local development

```bash
cp .env.example .env
npm ci
npm run dev
```

`VITE_API_ENDPOINT` is embedded in the browser bundle. It must be a public URL, never a secret.

## Verification

```bash
npm run lint
npm test
npm run build
npm run audit:production
```

## Container

The production image builds the static bundle and serves it from an unprivileged Nginx process on port 8080. Compose publishes it only on host loopback by default so a host reverse proxy can provide TLS.

```bash
VITE_API_ENDPOINT=https://api.example.com docker compose up --build
curl --fail http://127.0.0.1:5000/healthz
```

## GitHub deployment

Pull requests and `main` run lint, tests, build, dependency audit, container build, and image scanning. The deployment workflow is manual and uses the protected `production` environment.

Configure the repository variable `VITE_API_ENDPOINT` and these production environment secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_KNOWN_HOSTS`
- `GHCR_USER`
- `GHCR_PULL_TOKEN`

Prepare `/srv/codestra` on the target host and authorize the deployment key before enabling the workflow. Keep the GitHub environment approval requirement enabled.

## Security notes

- Authorization must always be enforced by the backend.
- The current backend returns a bearer token consumed by the SPA. Moving authentication to secure `HttpOnly` cookies requires a coordinated backend change and remains recommended.
- Never commit `.env` files or credentials.
- Production dependencies are audited without exceptions in CI.

## License

Proprietary. See `LICENSE`.
