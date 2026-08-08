import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";

const endpoint = process.env.LIBRETRANSLATE_URL ?? "http://127.0.0.1:15000";
const locales = ["es", "fr"];
const localesRoot = new URL("../src/locales/", import.meta.url);
const artifactPath = new URL("../docs/approved-machine-translations.json", import.meta.url);
const technical = /^(?:Codestra|Odoo|VICIdial|n8n|API|CRM|Shopify|Salesforce|HubSpot|Google Calendar|Microsoft Outlook|English|Español|Français|React|Vue(?:\.js)?|Node(?:\.js)?|Python|Django|Flask|FastAPI|Laravel|Bootstrap|Flutter|Svelte|Tailwind CSS|Material Design|Ant Design|Carbon|Fluent|Foundation|Hootsuite|Buffer|Sprout Social|Canva|Loomly|[\d$%.,+ -]+)$/;
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
  return {
    placeholders,
    text: placeholders.reduce((text, placeholder, index) => text.replace(placeholder, `ZXQPH${index}QXZ`), value),
  };
};

const restore = (value, placeholders) => placeholders.reduce(
  (text, placeholder, index) => text.replaceAll(`ZXQPH${index}QXZ`, placeholder),
  value,
);

async function translateBatch(texts, target, attempt = 0) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);
  try {
    const response = await fetch(`${endpoint}/translate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: texts, source: "en", target, format: "text" }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`LibreTranslate returned ${response.status}`);
    const payload = await response.json();
    const output = Array.isArray(payload.translatedText) ? payload.translatedText : [payload.translatedText];
    if (output.length !== texts.length || output.some((item) => typeof item !== "string")) throw new Error("Unexpected translation response");
    return output;
  } catch (error) {
    if (texts.length > 1) {
      const middle = Math.ceil(texts.length / 2);
      return [
        ...await translateBatch(texts.slice(0, middle), target, attempt),
        ...await translateBatch(texts.slice(middle), target, attempt),
      ];
    }
    if (attempt < 2) return translateBatch(texts, target, attempt + 1);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const namespaces = (await readdir(new URL("en/", localesRoot))).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -5)).sort();
const artifact = { format: "codestra-approved-machine-translations-v2", generated_at: new Date().toISOString(), entries: [] };

for (const locale of locales) {
  for (const namespace of namespaces) {
    const sourceUrl = new URL(`en/${namespace}.json`, localesRoot);
    const targetUrl = new URL(`${locale}/${namespace}.json`, localesRoot);
    const source = JSON.parse(readFileSync(sourceUrl, "utf8"));
    const target = JSON.parse(readFileSync(targetUrl, "utf8"));
    const pending = flatten(source).filter(({ path, value }) => getAt(target, path) === value && !technical.test(value));
    for (let offset = 0; offset < pending.length; offset += 10) {
      const batch = pending.slice(offset, offset + 10);
      const protectedValues = batch.map(({ value }) => protect(value));
      const translated = await translateBatch(protectedValues.map(({ text }) => text), locale);
      translated.forEach((raw, index) => {
        const entry = batch[index];
        const restored = restore(raw, protectedValues[index].placeholders);
        const expected = [...entry.value.matchAll(placeholderPattern)].map((match) => match[0]).sort();
        const actual = [...restored.matchAll(placeholderPattern)].map((match) => match[0]).sort();
        if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`Placeholder mismatch: ${locale}/${namespace}:${entry.path.join(".")}`);
        setAt(target, entry.path, restored);
        artifact.entries.push({ component: namespace, locale, context: entry.path.join("."), source: entry.value, target: restored });
      });
      process.stdout.write(`\r${locale}/${namespace}: ${Math.min(offset + batch.length, pending.length)}/${pending.length}`);
    }
    if (pending.length) process.stdout.write("\n");
    writeFileSync(targetUrl, `${JSON.stringify(target, null, 2)}\n`);
  }
}

writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`approved_machine_translations_applied=${artifact.entries.length}`);
