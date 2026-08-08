import { readFileSync, writeFileSync } from "node:fs";

const overrides = {
  es: {
    "industries:content.logistics-ai.eyebrow": "IA de Codestra para logística",
    "industries:content.legal-ai.eyebrow": "IA de Codestra para servicios legales",
    "industries:content.legal-ai.intake.0": "Área de práctica",
    "industries:content.legal-ai.actions.0": "Recepcionista legal con IA",
    "industries:content.legal-ai.scenarios.0.outcome": "Admisión preliminar preparada para revisión autorizada.",
    "industries:content.healthcare-ai.eyebrow": "IA de Codestra para atención médica",
    "industries:content.senior-care-ai.eyebrow": "IA de Codestra para cuidado de personas mayores",
    "industries:content.real-estate-ai.eyebrow": "IA de Codestra para bienes raíces",
    "industries:content.financial-services-ai.eyebrow": "IA de Codestra para servicios financieros",
    "industries:content.ecommerce-ai.eyebrow": "IA de Codestra para comercio electrónico",
    "industries:content.ecommerce-ai.routing.3": "Especialista humano",
    "industries:content.hospitality-ai.eyebrow": "IA de Codestra para hotelería",
    "industries:content.hospitality-ai.actions.0": "Recepcionista de hotel con IA",
    "industries:content.construction-ai.eyebrow": "IA de Codestra para construcción",
    "industries:content.agriculture-ai.eyebrow": "IA de Codestra para agricultura",
    "industries:content.education-ai.eyebrow": "IA para educación y capacitación",
    "industries:content.veterinary-ai.products.9": "Enrutamiento entre múltiples ubicaciones",
    "industries:content.restaurant-ai.products.9": "Informes de múltiples ubicaciones",
    "industries:content.manufacturing-ai.actions.5": "Notificar pedidos retrasados",
    "industries:content.recruitment-ai.eyebrow": "IA para reclutamiento y recursos humanos",
    "industries:content.marketing-media-ai.products.7": "Panel de informes"
  },
  fr: {
    "industries:content.logistics-ai.eyebrow": "IA Codestra pour la logistique",
    "industries:content.healthcare-ai.eyebrow": "IA Codestra pour les soins de santé",
    "industries:content.ecommerce-ai.eyebrow": "IA Codestra pour le commerce électronique",
    "industries:content.hospitality-ai.eyebrow": "IA Codestra pour l’hôtellerie",
    "industries:content.construction-ai.eyebrow": "IA Codestra pour la construction",
    "industries:content.agriculture-ai.eyebrow": "IA Codestra pour l’agriculture"
  }
};

const artifactUrl = new URL("../docs/approved-machine-translations.json", import.meta.url);
const artifact = JSON.parse(readFileSync(artifactUrl, "utf8"));
for (const [locale, entries] of Object.entries(overrides)) {
  const catalogs = new Map();
  for (const [reference, target] of Object.entries(entries)) {
    const [namespace, pathText] = reference.split(":");
    if (!catalogs.has(namespace)) {
      const url = new URL(`../src/locales/${locale}/${namespace}.json`, import.meta.url);
      catalogs.set(namespace, { url, value: JSON.parse(readFileSync(url, "utf8")) });
    }
    const catalog = catalogs.get(namespace).value;
    const path = pathText.split(".");
    const parent = path.slice(0, -1).reduce((value, key) => value[key], catalog);
    const finalKey = path.at(-1);
    const sourceCatalog = JSON.parse(readFileSync(new URL(`../src/locales/en/${namespace}.json`, import.meta.url), "utf8"));
    const source = path.reduce((value, key) => value[key], sourceCatalog);
    parent[finalKey] = target;
    artifact.entries.push({ component: namespace, locale, context: pathText, source, target, method: "reviewed-override" });
  }
  for (const { url, value } of catalogs.values()) writeFileSync(url, `${JSON.stringify(value, null, 2)}\n`);
}
writeFileSync(artifactUrl, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`reviewed_translation_overrides_applied=${Object.values(overrides).reduce((sum, entries) => sum + Object.keys(entries).length, 0)}`);
