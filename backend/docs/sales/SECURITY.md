# Scraper security

Only `http` and `https` on ports 80/443 are accepted. URL credentials, fragments, unsupported schemes, loopback, private, link-local, multicast, reserved, unspecified, documentation, metadata, and internal addresses are rejected for IPv4 and IPv6. All DNS answers must be public; DNS changes between validation and connection fail as rebinding. Every redirect repeats validation.

Robots rules are enforced before page retrieval. Executables and unsupported MIME types are rejected. HTML nodes/text, JSON-LD records, pages, depth, redirects, bytes, timeouts, retries, and rate are bounded. The crawler never authenticates to targets or bypasses access controls/CAPTCHA.

Connections use the validated address while preserving the original hostname for HTTP Host and HTTPS certificate/SNI verification. A second DNS resolution must match the first before connection. Mixed public/private answer sets fail closed. Redirect locations restart the complete URL and DNS validation process.

Do not log request credentials, response bodies, extracted email/phone values, or evidence snippets. Application logs should contain opaque job/page IDs and reason codes. Public availability is not consent; suppression, lawful-basis, and outreach approval are deliberately outside this crawler.
# Minimal runtime and CVE evidence

The production crawler image uses digest-pinned Chainguard Python builder and
runtime images. The final image contains no shell or package manager and runs as
UID/GID 65532. Build tooling remains confined to the discarded builder stage.

`security/crawler-runtime.openvex.json` documents CVE-2026-54876 for the exact
Wolfi OpenSSL 3.6.3 packages. The upstream OpenSSL advisory rates the issue Low
and limits the affected path to clients explicitly enabling
`X509_V_FLAG_OCSP_RESP_CHECK` or `X509_V_FLAG_OCSP_RESP_CHECK_ALL`. The crawler
does not set either flag. The VEX statement must be removed when the pinned
runtime advances to OpenSSL 3.6.4 or later.
