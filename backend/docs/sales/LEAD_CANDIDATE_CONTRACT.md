# LeadCandidate contract

Schema `lead-candidate.v1` contains tenant and campaign UUIDs, normalized company identity, nullable contact identity, source URLs, field evidence, extracted `mailto`/`tel` values, confidence, provenance, validation results, rejection reasons, content hashes, and idempotency hashes.

Unknown values are `null` or empty lists. A contact name or title is populated only from explicit structured public evidence. Every evidence record contains its URL and a bounded snippet. Public availability is provenance, not consent or authorization to contact.

## Version 1 invariants

- `tenant_id` and `campaign_id` are required and form the isolation boundary.
- `source_urls`, retrieval timestamps, and SHA-256 content hashes make observations traceable without claiming truth.
- `company` and `contact` contain normalized identities; absent facts stay null.
- `evidence` associates an extracted field with a bounded public snippet and URL.
- `confidence` is advisory. `validation_results` records checks, while `rejection_reasons` records why evidence was not accepted.
- `idempotency.key_hash` is stored instead of the caller's key and is unique inside a tenant/campaign pair.
- `schema_version` is mandatory. Consumers must reject unsupported major versions rather than guessing.

The response contract is persisted in `LeadCandidate.contract`; job APIs return state and identifiers, not an authorization to contact or deliver the candidate.
