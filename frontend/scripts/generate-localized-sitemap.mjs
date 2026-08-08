import { writeFileSync } from "node:fs";
import { coreRoutes, industries, locales, localizedPath, industryEntry } from "./seo-manifest.mjs";

const base = "https://codestra.co";
const paths = [...coreRoutes.filter((route) => route.indexable).map((route) => route.path), ...industries.map((slug) => industryEntry(slug, "en")).filter((route) => route.indexable).map((route) => route.path)];
const escape = (value) => value.replaceAll("&", "&amp;");
const urls = paths.flatMap((path) => locales.map((locale) => {
  const localized = `${base}${localizedPath(locale, path)}`;
  const alternatives = locales.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escape(`${base}${localizedPath(alternate, path)}`)}"/>`).join("");
  const defaultUrl = `${base}${localizedPath("en", path)}`;
  return `<url><loc>${escape(localized)}</loc>${alternatives}<xhtml:link rel="alternate" hreflang="x-default" href="${escape(defaultUrl)}"/></url>`;
}));
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>\n`);
console.log(`Generated ${urls.length} localized sitemap URLs.`);
