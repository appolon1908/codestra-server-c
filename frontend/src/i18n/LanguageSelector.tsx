import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { localeNames, supportedLocales, type SupportedLocale } from "./locale-types";
import { localizePath } from "./locale-resolver";
import { saveLocale } from "./locale-storage";

type Props = { id?: string; className?: string };

export default function LanguageSelector({ id = "codestra-language", className = "" }: Props) {
  const { i18n, t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const current = (supportedLocales.includes(i18n.resolvedLanguage as SupportedLocale) ? i18n.resolvedLanguage : "en") as SupportedLocale;

  const change = (locale: SupportedLocale) => {
    saveLocale(locale);
    try { window.sessionStorage.setItem("codestra.locale_source", "user_selection"); } catch { /* optional storage */ }
    void i18n.changeLanguage(locale);
    void fetch(`${import.meta.env.VITE_API_ENDPOINT ?? ""}/api/v1/localization/preference`, {method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale})}).catch(() => undefined);
    navigate(`${localizePath(location.pathname, locale)}${location.search}${location.hash}`);
  };

  return <div className={`codestra-language-selector ${className}`}>
    <label className="sr-only" htmlFor={id}>{t("language")}</label>
    <select id={id} value={current} onChange={(event) => change(event.target.value as SupportedLocale)} aria-label={t("language")}>
      {supportedLocales.map((locale) => <option key={locale} value={locale}>{localeNames[locale]}</option>)}
    </select>
  </div>;
}
