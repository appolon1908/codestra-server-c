import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";

const endpoint = process.env.LIBRETRANSLATE_URL ?? "http://127.0.0.1:15000";
const localesRoot = new URL("../src/locales/", import.meta.url);
const artifactPath = new URL("../docs/approved-machine-translations.json", import.meta.url);
const immutable = /^(?:Codestra|Odoo|VICIdial|n8n|API|CRM|Shopify|Salesforce|HubSpot|Google Calendar|Microsoft Outlook|English|Español|Français|React(?:\.js)?|Vue(?:\.js)?|Node(?:\.js)?|Python|Django|Flask|FastAPI|Laravel|Bootstrap|Flutter|Svelte|Tailwind CSS|Material Design|Ant Design|Carbon|Fluent|Foundation|Hootsuite|Buffer|Sprout Social|Canva|Loomly|Services|Solutions|Message|Province|Vision|FAQ|Legal AI|María Santos|Necesito programar una consulta\.|Claro\. Tengo disponibilidad mañana\.|[\d$%.,+© -]+)$/;
const ignoredPath = (namespace, key) =>
  (namespace === "industries" && /\.integrations\.\d+\.name$/.test(key))
  || (namespace === "home" && /\.(?:frontendTools|tools)\.\d+\.name$/.test(key))
  || (namespace === "navigation" && /servicesMenu\.(?:codestraSrl|reactJs|python)$/.test(key));
const placeholderPattern = /{{[^{}]+}}/g;

const flatten = (value, path = [], result = []) => {
  if (typeof value === "string") result.push({ path, value });
  else if (Array.isArray(value)) value.forEach((entry, index) => flatten(entry, [...path, index], result));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, entry]) => flatten(entry, [...path, key], result));
  return result;
};
const getAt = (value, path) => path.reduce((current, key) => current[key], value);
const setAt = (value, path, translated) => {
  const parent = path.slice(0, -1).reduce((current, key) => current[key], value);
  parent[path.at(-1)] = translated;
};
const protect = (value) => {
  const placeholders = value.match(placeholderPattern) ?? [];
  return { placeholders, text: placeholders.reduce((text, item, index) => text.replace(item, `ZXQPH${index}QXZ`), value) };
};
const restore = (value, placeholders) => placeholders.reduce((text, item, index) => text.replaceAll(`ZXQPH${index}QXZ`, item), value);

async function translate(q, source, target) {
  const response = await fetch(`${endpoint}/translate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q, source, target, format: "text" }),
  });
  if (!response.ok) throw new Error(`LibreTranslate ${source}->${target} returned ${response.status}`);
  return (await response.json()).translatedText;
}

const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
const namespaces = (await readdir(new URL("en/", localesRoot))).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -5)).sort();
let applied = 0;
const unresolved = [];
for (const locale of ["es", "fr"]) {
  const pivot = locale === "es" ? "fr" : "es";
  for (const namespace of namespaces) {
    const sourceUrl = new URL(`en/${namespace}.json`, localesRoot);
    const targetUrl = new URL(`${locale}/${namespace}.json`, localesRoot);
    const source = JSON.parse(readFileSync(sourceUrl, "utf8"));
    const target = JSON.parse(readFileSync(targetUrl, "utf8"));
    const pending = flatten(source).filter(({ path, value }) => {
      const key = path.join(".");
      return getAt(target, path) === value && !immutable.test(value) && !ignoredPath(namespace, key);
    });
    for (const entry of pending) {
      const secured = protect(entry.value);
      const intermediate = await translate(secured.text, "en", pivot);
      const raw = await translate(intermediate, pivot, locale);
      const translated = restore(raw, secured.placeholders);
      const expected = [...entry.value.matchAll(placeholderPattern)].map((match) => match[0]).sort();
      const actual = [...translated.matchAll(placeholderPattern)].map((match) => match[0]).sort();
      if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`Placeholder mismatch: ${locale}/${namespace}:${entry.path.join(".")}`);
      if (translated === entry.value) {
        unresolved.push(`${locale}/${namespace}:${entry.path.join(".")}`);
        continue;
      }
      setAt(target, entry.path, translated);
      artifact.entries.push({ component: namespace, locale, context: entry.path.join("."), source: entry.value, target: translated, method: `pivot:${pivot}` });
      applied += 1;
    }
    writeFileSync(targetUrl, `${JSON.stringify(target, null, 2)}\n`);
  }
}
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`pivot_machine_translations_applied=${applied}`);
console.log(`pivot_machine_translations_unresolved=${unresolved.length}`);
if (unresolved.length) console.log(unresolved.join("\n"));
