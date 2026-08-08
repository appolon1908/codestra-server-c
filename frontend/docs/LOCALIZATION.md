# Codestra localization architecture

The React application uses pinned `i18next`, `react-i18next`, and browser-language detection support with English source/fallback catalogs plus Spanish and French catalogs. Catalogs are split by semantic namespace in `src/locales`.

Localized URLs are authoritative. Nonlocalized URLs redirect once while retaining the query string. Resolution order is URL, explicit saved choice, browser language, optional server country suggestion, then English. Country detection never changes a saved language.

API enum values, campaign codes, analytics names, routes, environment variables, trademarks, telephone numbers, and email addresses are not translated. Forms submit stable enum codes plus `preferred_language`, `content_locale`, `country_code`, and `locale_source`.

Run `npm run audit:i18n`, `npm run audit:i18n-coverage`, `npm test`, `npm run test:e2e -- tests/e2e/localization.spec.ts`, and `npm run build`. Use `npm run report:i18n-review` for a concise locale/namespace review queue; it intentionally exits nonzero until every non-English entry is present and human-approved. The allowlist is deliberately small and must not be used to hide translatable prose.

Weblate owns reviewed translations through a protected `translations/i18n` branch and pull request. LibreTranslate provides on-demand suggestions. Spanish and French machine output may be accepted only after explicit approval and catalog-value validation.
