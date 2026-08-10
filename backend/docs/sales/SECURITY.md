# Scraper security

Only `http` and `https` on ports 80/443 are accepted. URL credentials, fragments, unsupported schemes, loopback, private, link-local, multicast, reserved, unspecified, documentation, metadata, and internal addresses are rejected for IPv4 and IPv6. All DNS answers must be public; DNS changes between validation and connection fail as rebinding. Every redirect repeats validation.

Robots rules are enforced before page retrieval. Executables and unsupported MIME types are rejected. HTML nodes/text, JSON-LD records, pages, depth, redirects, bytes, timeouts, retries, and rate are bounded. The crawler never authenticates to targets or bypasses access controls/CAPTCHA.

Connections use the validated address while preserving the original hostname for HTTP Host and HTTPS certificate/SNI verification. A second DNS resolution must match the first before connection. Mixed public/private answer sets fail closed. Redirect locations restart the complete URL and DNS validation process.

Do not log request credentials, response bodies, extracted email/phone values, or evidence snippets. Application logs should contain opaque job/page IDs and reason codes. Public availability is not consent; suppression, lawful-basis, and outreach approval are deliberately outside this crawler.

## Container vulnerability policy

Production publication requires both Trivy and Grype to pass the approved HIGH/CRITICAL policy against the same immutable image digest using refreshed databases. Findings must not be suppressed merely because one scanner does not detect them or because a distribution labels them `not-fixed` or `wont-fix`.

The runtime base is digest-pinned. Python's standard library performs the container health request so the image does not install `curl` solely for health checking. CI uses the same Python minor version as the runtime.

The 2026-08-10 reconciliation reduced the candidate image from 36 to 25 Trivy findings and from 58 to 32 Grype findings, but did not clear the release gate. Publication and deployment remain prohibited pending patched upstream packages or an evidence-backed security-owner disposition.
