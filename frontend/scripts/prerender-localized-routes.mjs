import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { coreRoutes, industries, locales, utilityRoutes, localizedPath, industryEntry } from "./seo-manifest.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "..", "dist");
const base = "https://codestra.co";
const socialImage = `${base}/og/codestra-default.png`;
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const indexableRoutes = [...coreRoutes, ...industries.map((slug) => industryEntry(slug, "en")).filter((route) => route.indexable)];
const noindexRoutes = industries.map((slug) => industryEntry(slug, "en")).filter((route) => !route.indexable);
const template = existsSync(join(dist, "index.html")) ? readFileSync(join(dist, "index.html"), "utf8") : "";
const productionAssetTags = [...template.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag).join("");
const productionScriptTag = template.match(/<script type="module"[^>]*><\/script>/)?.[0] ?? '<script type="module" src="/assets/index.js"></script>';

function page(route, locale) {
  const title = route.titles[locale] ?? route.titles.en;
  const description = route.descriptions[locale] ?? route.descriptions.en;
  const heading = route.heading[locale] ?? route.heading.en;
  const path = localizedPath(locale, route.path);
  const alternatives = locales.map((alt) => `<link rel="alternate" hreflang="${alt}" href="${base}${localizedPath(alt, route.path)}" />`).join("") + `<link rel="alternate" hreflang="x-default" href="${base}${localizedPath("en", route.path)}" />`;
  const data = { "@context": "https://schema.org", "@type": route.path === "" ? "Organization" : "WebPage", name: title, description, url: `${base}${path}` };
  return `<!doctype html><html lang="${locale}" data-theme="black"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>${productionAssetTags}<title>${escape(title)}</title><meta name="description" content="${escape(description)}"/><link rel="canonical" href="${base}${path}"/>${alternatives}<meta property="og:type" content="website"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${base}${path}"/><meta property="og:locale" content="${locale}"/><meta property="og:image" content="${socialImage}"/><meta property="og:image:alt" content="Codestra software and AI platform"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escape(title)}"/><meta name="twitter:description" content="${escape(description)}"/><meta name="twitter:image" content="${socialImage}"/><script type="application/ld+json">${JSON.stringify(data)}</script></head><body><div id="root"><main><header><a href="${localizedPath(locale, "")}">Codestra</a></header><article><p>Codestra</p><h1>${escape(heading)}</h1><p>${escape(description)}</p><p><a href="${localizedPath(locale, "contact")}">${locale === "es" ? "Iniciar un proyecto" : locale === "fr" ? "Démarrer un projet" : "Start a project"}</a> <a href="${localizedPath(locale, "services")}">${locale === "es" ? "Explorar soluciones" : locale === "fr" ? "Explorer les solutions" : "Explore solutions"}</a></p></article></main></div>${productionScriptTag}</body></html>`;
}

for (const locale of locales) for (const route of indexableRoutes) {
  const output = page(route, locale);
  const target = join(dist, locale, route.path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output);
}
for (const locale of locales) for (const route of noindexRoutes) {
  const output = page(route, locale).replace('</head>', '<meta name="robots" content="noindex,follow"/></head>');
  const target = join(dist, locale, route.path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output);
}
for (const locale of locales) for (const path of utilityRoutes) {
  const target = join(dist, locale, path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  const title = path === "thank-you" ? "Thank you | Codestra" : "Codestra";
  writeFileSync(target, `<!doctype html><html lang="${locale}"><head><meta charset="UTF-8">${productionAssetTags}<meta name="robots" content="noindex,follow"><title>${title}</title></head><body><div id="root"></div>${productionScriptTag}</body></html>`);
}
// Preserve legacy non-localized deep links without falling back unknown URLs.
// The redirect script keeps safe query attribution (UTM/GCLID/FBCLID) intact.
const legacyPaths = [
  ...coreRoutes.map((route) => route.path),
  ...industries.map((slug) => `industries/${slug}`),
  ...utilityRoutes,
];
for (const path of legacyPaths) {
  if (!path) continue;
  const target = join(dist, path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  const destination = `/en/${path}`;
  writeFileSync(target, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Redirecting to Codestra</title></head><body><p>Redirecting to Codestra.</p><script>window.location.replace(${JSON.stringify(destination)}+window.location.search);</script></body></html>`);
}
for (const path of legacyPaths) {
  if (!path) continue;
  const target = join(dist, "ht", path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  const destination = `/en/${path}`;
  writeFileSync(target, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Redirecting to Codestra</title></head><body><p>Redirecting to Codestra.</p><script>window.location.replace(${JSON.stringify(destination)}+window.location.search);</script></body></html>`);
}
writeFileSync(join(dist, "index.html"), '<!doctype html><html lang="en"><head><meta http-equiv="refresh" content="0;url=/en/"><meta name="robots" content="noindex"><title>Redirecting to Codestra</title></head><body></body></html>');
console.log(`Prerendered ${indexableRoutes.length * locales.length} indexable and ${noindexRoutes.length * locales.length} noindex localized routes.`);
