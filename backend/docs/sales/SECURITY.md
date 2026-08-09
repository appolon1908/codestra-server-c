# Scraper security

Only `http` and `https` on ports 80/443 are accepted. URL credentials, fragments, unsupported schemes, loopback, private, link-local, multicast, reserved, unspecified, documentation, metadata, and internal addresses are rejected for IPv4 and IPv6. All DNS answers must be public; DNS changes between validation and connection fail as rebinding. Every redirect repeats validation.

Robots rules are enforced before page retrieval. Executables and unsupported MIME types are rejected. HTML nodes/text, JSON-LD records, pages, depth, redirects, bytes, timeouts, retries, and rate are bounded. The crawler never authenticates to targets or bypasses access controls/CAPTCHA.

Connections use the validated address while preserving the original hostname for HTTP Host and HTTPS certificate/SNI verification. A second DNS resolution must match the first before connection. Mixed public/private answer sets fail closed. Redirect locations restart the complete URL and DNS validation process.

Do not log request credentials, response bodies, extracted email/phone values, or evidence snippets. Application logs should contain opaque job/page IDs and reason codes. Public availability is not consent; suppression, lawful-basis, and outreach approval are deliberately outside this crawler.
