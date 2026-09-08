# Appolon repository and release authority

Canonical repository: appolon1908-hue/codestra-server-c.

The migration preserves all 11 legacy remote branches plus the local agent/scraper-tenant-remediation branch at b2ec94de629ec2a94f05962ead1a47aa41f75e0c. There were no source tags. Ref identities were compared after push; source Git bundles and ref manifests are retained separately. The original Server C checkout origin remains unchanged pending completion of review.

The old local image sha256:e0fc48f7018ab8eec258704f16c08908075f161ddbf3467be201c8392ecc7a52 is a candidate only. It is not a certified release.

Release blockers:
- Remediation HEAD is not reachable from protected main. Review its PR before certification; do not bypass ancestry checks.
- GitHub rejected required-reviewer environment rules on the current billing plan. Actions remain disabled until independent review protection is supported and verified.
- Merge this namespace/provenance change through protected review before publishing to the appolon GHCR namespace.

The release workflow performs tests, dependency/image scans, SBOM and provenance generation and verification. Published metadata must bind exact source SHA and tree, digest and workflow identity. Exact-digest production approval remains separate. No crawler runtime is enabled by migration.

Protected secret names only (no values migrated): DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY, DEPLOY_KNOWN_HOSTS, GHCR_USER, GHCR_PULL_TOKEN. GITHUB_TOKEN is provided by GitHub for CI; do not copy it. Secret-name documentation does not create secrets.

Required environments: image-release and production, protected branches only, independent reviewer with self-review prevented. Do not create an unprotected substitute. Deployments remain forbidden until independently approved.
