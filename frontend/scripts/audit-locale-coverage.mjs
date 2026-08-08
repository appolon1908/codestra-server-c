import { readFileSync } from "node:fs";

const localesRoot = new URL("../src/locales/", import.meta.url);
const locales = ["es", "fr"];
const namespaces = ["common", "navigation", "forms", "auth", "contact", "billing", "services", "about", "hiring", "caseStudies", "ai-receptionist", "industries", "pricing", "legal", "errors", "seo", "home", "conversion"];
const ignoredEqualValues = /^(?:Codestra|Odoo|VICIdial|n8n|API|CRM|Shopify|Salesforce|HubSpot|Google Calendar|Microsoft Outlook|English|Español|Français|React(?:\.js)?|Vue(?:\.js)?|Node(?:\.js)?|Python|Django|Flask|FastAPI|Laravel|Bootstrap|Flutter|Svelte|Tailwind CSS|Material Design|Ant Design|Carbon|Fluent|Foundation|Hootsuite|Buffer|Sprout Social|Canva|Loomly|Services|Solutions|Message|Province|Vision|FAQ|Legal AI|Sector|Documentation|Contact Codestra|Canada|Agents|Clients|© \{\{year\}\} Codestra|María Santos|Necesito programar una consulta\.|Claro\. Tengo disponibilidad mañana\.|[\d$%.,+© -]+)$/;
const ignoredEqualPath = (namespace, key) =>
  (namespace === "industries" && /\.integrations\.\d+\.name$/.test(key))
  || (namespace === "home" && /\.(?:frontendTools|tools)\.\d+\.name$/.test(key))
  || (namespace === "navigation" && /servicesMenu\.(?:codestraSrl|reactJs|python)$/.test(key));
const summaryOnly = process.argv.includes("--summary");

const flatten = (value, prefix = "", result = new Map()) => {
  if (typeof value === "string") result.set(prefix, value);
  else if (Array.isArray(value)) value.forEach((entry, index) => flatten(entry, `${prefix}.${index}`, result));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, entry]) => flatten(entry, prefix ? `${prefix}.${key}` : key, result));
  return result;
};

const failures = [];
const counts = new Map();
for (const namespace of namespaces) {
  const english = flatten(JSON.parse(readFileSync(new URL(`en/${namespace}.json`, localesRoot), "utf8")));
  for (const locale of locales) {
    const translated = flatten(JSON.parse(readFileSync(new URL(`${locale}/${namespace}.json`, localesRoot), "utf8")));
    for (const [key, source] of english) {
      const value = translated.get(key);
      const reason = value === undefined
        ? "MISSING"
        : value === source && !ignoredEqualValues.test(source) && !ignoredEqualPath(namespace, key)
          ? "UNTRANSLATED"
          : null;
      if (reason) {
        failures.push(`${locale}/${namespace}:${key}: ${reason}`);
        const countKey = `${locale}/${namespace}`;
        counts.set(countKey, (counts.get(countKey) ?? 0) + 1);
      }
    }
  }
}

if (failures.length) {
  if (summaryOnly) {
    for (const [scope, count] of [...counts].sort()) console.error(`${scope}: ${count}`);
  } else {
    console.error(failures.join("\n"));
  }
  console.error(`Found ${failures.length} missing or untranslated catalog entries.`);
  process.exit(1);
}
console.log("All locale catalogs cover the English source without unapproved fallbacks.");
