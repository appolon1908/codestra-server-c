# Web runbook

Build, test, prerender, validate SEO/accessibility, and scan the output for secrets/source maps. Deploy an immutable image to staging, verify health and middleware-only form routing, then run smoke/security/restart tests. Production publication requires approval. Roll back by restoring the previous image variables and Caddy/config snapshot.
