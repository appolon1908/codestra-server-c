# Runtime vulnerability reconciliation

## Image basis

- Runtime: `cgr.dev/chainguard/python@sha256:69437de912cc3b5d36a2480b8fb0c3f658f151d8bc1978d19a6412be3a4983d5`
- Runtime user: numeric non-root UID/GID `65532:65532`
- Runtime contains no shell, package manager, compiler, `curl`, `pip`, `setuptools`, or `wheel`.
- Trivy 0.72.0 result for the complete candidate image: zero HIGH and zero CRITICAL findings.
- Grype 0.117.0 result before policy disposition: two HIGH matches, both for the single vulnerability below.

## CVE-2026-54876

| Field | Evidence |
| --- | --- |
| Packages | `libcrypto3` and `libssl3` `3.6.3-r3` in the final Wolfi runtime |
| Duplicate status | One upstream OpenSSL vulnerability represented as two package matches |
| Source | NVD CPE catalog match used by Grype; not a Wolfi vendor advisory match |
| Upstream affected range | OpenSSL `>=3.6.0,<3.6.4` |
| Fix availability | No `3.6.4` Wolfi package is available as of 2026-08-11 |
| Upstream condition | A TLS client must explicitly enable `X509_V_FLAG_OCSP_RESP_CHECK` or `X509_V_FLAG_OCSP_RESP_CHECK_ALL`; upstream states OCSP response checking is not enabled by default |
| Application reachability | Not reachable: the repository contains no OCSP-response-check or OpenSSL verification-flag configuration, and Python's default SSL context used by Requests does not enable those OpenSSL OCSP response-check flags |
| Impact if reachable | Repeated connections to a malicious TLS server can leak memory and cause denial of service |
| Confidentiality/integrity | No impact according to the upstream advisory |
| Disposition | Temporarily accepted, exact-CVE/exact-package/exact-version only, because the vulnerable feature is disabled and no vendor fix exists |

Primary references:

- OpenSSL advisory: https://openssl-library.org/news/secadv/20260805.txt
- OpenSSL fix: https://github.com/openssl/openssl/commit/155b5fe0f93365e6df1c56ee3606b121080c6c12
- GitHub advisory: https://github.com/advisories/GHSA-5cfw-78wc-wvjq

The two narrowly scoped Grype entries in `.grype.yaml` must be deleted as soon
as a patched Chainguard runtime digest is available. Any package name, version,
or CVE change fails closed and requires a new reconciliation.
