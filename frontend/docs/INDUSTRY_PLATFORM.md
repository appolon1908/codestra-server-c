# Industry platform frontend

The platform uses the existing Codestra dark tokens, geometric typography, header, footer, button, card, focus, and responsive conventions. The only additions are industry workflow/demo/dashboard grids, breadcrumb, disclosure notice, searchable directory controls, progressive qualification, and a safe-area-aware mobile conversion bar. Industry content lives in `src/Pages/Industries/industryConfig.ts` and `industryConfigExpansion.ts`; the reusable renderer is `IndustryPlatform.tsx`.

All 25 configured routes have unique headings, product/action/routing content, scenarios, integrations, qualification questions, safeguards where required, metadata, conversion context, and category-aware related-industry navigation. The directory preserves search and category filters in the URL. Demonstration and dashboard data are visibly labeled simulations/sample data. Calculator values remain local until a visitor consents and submits a form.

Build with `npm ci && npm run build`. Test with `npm test` and `npm run test:e2e`. Set only public values from `.env.example`; never place Odoo or workflow secrets in Vite variables.
