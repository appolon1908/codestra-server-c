import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import i18n from "./index";
import { isSupportedLocale } from "./locale-types";
import { resolveLocale, localizePath } from "./locale-resolver";
import LocalizedSeo from "./LocalizedSeo";
import CountryLanguageSuggestion from "./CountryLanguageSuggestion";

export function LocaleBoundary() {
  const { locale } = useParams();
  const location = useLocation();
  useEffect(() => {
    if (!isSupportedLocale(locale)) return;
    if (i18n.resolvedLanguage !== locale) void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  if (!isSupportedLocale(locale)) {
    const pathname = locale === "ht"
      ? location.pathname.replace(/^\/ht(?=\/|$)/, "") || "/"
      : location.pathname;
    return <Navigate replace to={`/en${pathname}${location.search}${location.hash}`} />;
  }
  return <><LocalizedSeo /><CountryLanguageSuggestion /><Outlet /></>;
}

export function LocalizedRedirect() {
  const location = useLocation();
  const { locale } = resolveLocale(location.pathname);
  return <Navigate replace to={`${localizePath(location.pathname, locale)}${location.search}${location.hash}`} />;
}
