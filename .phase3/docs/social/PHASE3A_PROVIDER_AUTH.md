# Phase 3A provider authentication

## Postly

The deployed Postiz public API authenticates organization API keys and organization
OAuth tokens. It has no least-privilege machine-token model; an API key is treated as
organization superadmin. The existing organization credential is installed only in
the Middleware staging secret directory as `postiz_api_key`, owned by UID/GID 10001
with mode `0400`.

Private authentication validation returned `200` for the credential and `401` for
invalid and missing credentials. Middleware adapter health returned `AVAILABLE` and
account discovery returned an empty, valid list. No API write or social post occurred.

## Hootsuite external action

An operator with an approved Hootsuite developer account must create:

- application name: `Codestra Social Staging`;
- redirect URI: `https://middleware.codestra.co/api/v1/social/oauth/hootsuite/callback`;
- grant: OAuth 2 authorization code;
- scopes: `offline` initially; add `analytics:read` only when analytics is approved;
- client ID file: `/etc/codestra/secrets/middleware-staging/social/hootsuite_client_id`;
- client secret file: `/etc/codestra/secrets/middleware-staging/social/hootsuite_client_secret`;
- state secret file: `/etc/codestra/secrets/middleware-staging/social/hootsuite_oauth_state_secret`;
- token file: `/etc/codestra/secrets/middleware-staging/social/hootsuite_token.json`.

No Hootsuite credential was found or fabricated. Real OAuth and provider canary remain
blocked on this external account action and a positively classified staging account.
