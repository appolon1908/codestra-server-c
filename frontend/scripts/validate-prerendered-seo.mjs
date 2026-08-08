import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { coreRoutes, industries, locales, utilityRoutes, localizedPath, industryEntry } from "./seo-manifest.mjs";

const dist = new URL("../dist/", import.meta.url).pathname;
const routes = [...coreRoutes.map(({ path }) => path), ...industries.map((slug) => industryEntry(slug, "en")).filter((route) => route.indexable).map(({ path }) => path)];
const noindexRoutes = industries.map((slug) => industryEntry(slug, "en")).filter((route) => !route.indexable).map(({ path }) => path);
const fail = (message) => { throw new Error(message); };
const htmlAt = (locale, path) => readFileSync(join(dist, locale, path, "index.html"), "utf8");

const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail("sitemap contains duplicate URLs");
if (sitemapUrls.length !== routes.length * locales.length) fail(`sitemap expected ${routes.length * locales.length} URLs, found ${sitemapUrls.length}`);
for (const utility of utilityRoutes) if (sitemap.includes(`/${utility}`)) fail(`utility route is in sitemap: ${utility}`);
for (const locale of locales) for (const path of noindexRoutes) {
  const html = htmlAt(locale, path);
  if (!/<meta name="robots" content="noindex,follow"/.test(html)) fail(`${locale}/${path} must be noindex`);
  if (sitemap.includes(`/${locale}/${path}`)) fail(`noindex route is in sitemap: ${locale}/${path}`);
}

const assetPattern = /(?:href|src)=["']([^"']+)["']/g;
for (const locale of locales) for (const path of routes) {
  const html = htmlAt(locale, path);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) fail(`${locale}/${path} must have exactly one h1`);
  for (const required of ["description", "canonical", "alternate", "og:image", "twitter:card", "application/ld+json"]) if (!html.includes(required)) fail(`${locale}/${path} missing ${required}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== `https://codestra.co${localizedPath(locale, path)}`) fail(`canonical mismatch: ${locale}/${path}`);
  for (const alt of locales) if (!html.includes(`hreflang="${alt}" href="https://codestra.co${localizedPath(alt, path)}"`)) fail(`hreflang reciprocity missing: ${locale}/${path}/${alt}`);
  for (const [, asset] of html.matchAll(assetPattern)) if (asset.startsWith("/")) if (!existsSync(join(dist, asset.slice(1)))) fail(`missing production asset ${asset}`);
}

const png = readFileSync(join(dist, "og/codestra-default.png"));
if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) fail("OG image must be 1200x630 PNG");
console.log(`SEO validation passed: ${routes.length * locales.length} indexable pages, ${sitemapUrls.length} sitemap URLs, production assets present.`);
