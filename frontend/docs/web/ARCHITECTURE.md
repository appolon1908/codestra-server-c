# Public web architecture

Caddy terminates TLS and exposes only website applications. Browsers use public-safe Server C APIs, which route business submissions to middleware. Internal databases, Redis, AI runtime, Qdrant, Odoo, n8n, and VICIdial are never browser-addressable. Portal data is middleware-sourced and tenant-authorized.
