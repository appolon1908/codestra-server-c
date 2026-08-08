import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { localeNames, isSupportedLocale, type SupportedLocale } from "./locale-types";
import { localizePath } from "./locale-resolver";
import { readSavedLocale, saveLocale } from "./locale-storage";

export default function CountryLanguageSuggestion() {
  const [suggestion, setSuggestion] = useState<SupportedLocale | null>(null);
  const { t, i18n } = useTranslation("common");
  const location = useLocation(); const navigate = useNavigate();
  useEffect(() => {
    if (readSavedLocale()) return;
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_ENDPOINT ?? ""}/api/v1/localization/country`, {signal:controller.signal, credentials:"same-origin"})
      .then((response) => response.ok ? response.json() : null)
      .then((data: {suggested_locale?:string;country_code?:string}|null) => {
        if (data?.country_code) try { window.sessionStorage.setItem("codestra.country_code", data.country_code); } catch { /* optional storage */ }
        if (data && isSupportedLocale(data.suggested_locale) && data.suggested_locale !== i18n.resolvedLanguage) setSuggestion(data.suggested_locale);
      }).catch(() => undefined);
    return () => controller.abort();
  }, [i18n.resolvedLanguage]);
  if (!suggestion) return null;
  const choose = () => { saveLocale(suggestion); try {window.sessionStorage.setItem("codestra.locale_source","country_suggestion");}catch{/* optional storage */} void i18n.changeLanguage(suggestion); navigate(`${localizePath(location.pathname,suggestion)}${location.search}${location.hash}`); setSuggestion(null); };
  return <aside className="codestra-language-prompt" role="region" aria-live="polite">
    <p>{t("languagePrompt", {language:localeNames[suggestion]})}</p>
    <div><button type="button" onClick={choose}>{t("viewLanguage", {language:localeNames[suggestion]})}</button><button type="button" onClick={() => {saveLocale("en");setSuggestion(null);}}>{t("keepEnglish")}</button><button type="button" aria-label={t("close")} onClick={() => setSuggestion(null)}>×</button></div>
  </aside>;
}
