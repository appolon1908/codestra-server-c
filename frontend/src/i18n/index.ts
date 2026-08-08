import i18n, { type BackendModule, type ReadCallback } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { isSupportedLocale } from "./locale-types";

type LocaleModule = { default: Record<string, unknown> };
const catalogLoaders = import.meta.glob<LocaleModule>("../locales/*/*.json");

const lazyCatalogBackend: BackendModule = {
  type: "backend",
  init: () => undefined,
  read(language: string, namespace: string, callback: ReadCallback) {
    const loader = catalogLoaders[`../locales/${language}/${namespace}.json`];
    if (!loader) {
      callback(new Error(`Unsupported locale catalog: ${language}/${namespace}`), false);
      return;
    }
    void loader().then((module) => callback(null, module.default)).catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error)), false));
  },
};

const urlLocale = window.location.pathname.split("/")[1];
const initialLocale = isSupportedLocale(urlLocale) ? urlLocale : "en";

void i18n
  .use(lazyCatalogBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: initialLocale,
    supportedLngs: ["en", "es", "fr"],
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "navigation", "forms", "auth", "contact", "billing", "services", "about", "hiring", "caseStudies", "ai-receptionist", "industries", "pricing", "legal", "errors", "seo", "home", "conversion"],
    interpolation: { escapeValue: false },
    returnNull: false,
    detection: { order: [], caches: [] },
    react: { useSuspense: true },
  });

export default i18n;
