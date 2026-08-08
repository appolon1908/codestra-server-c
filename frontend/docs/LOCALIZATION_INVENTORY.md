# Localization inventory — 2026-08-02

## Architecture baseline

- React 19.2.7, Vite 6, TypeScript, React Router 8, npm and the existing `package-lock.json`.
- 65 TypeScript/TSX source files.
- 25 industry detail routes plus the directory, AI Receptionist, conversion, legal, account, company, services and billing routes.
- Baseline: lint PASS; unit 4/4 PASS; production build PASS; browser 252 PASS, 10 skipped, 4 pre-existing failures caused by an unset public demo telephone value.

## Catalog migration

Catalog namespaces: common, navigation, forms, ai-receptionist, industries, pricing, legal, errors and SEO. English is source/fallback. Each locale currently contains 94 catalog leaf values.

The semantic audit excludes technical identifiers, component/CSS names, API routes, analytics event codes and test selectors. Its current result is 435 visible hard-coded occurrences awaiting catalog migration and human review. This is an explicit incomplete gate, not an allowlisted exception.

## Protected content

Do not machine-publish legal, security, consent, healthcare, financial, pricing or CTA content. Codestra, Odoo, VICIdial, n8n, endpoint paths, environment variables, campaign codes, submission IDs, UTM names, email addresses and telephone numbers remain untranslated.
