import { isSupportedLocale, type LocaleSource, type SupportedLocale } from "./locale-types";
import { readSavedLocale } from "./locale-storage";

export type LocaleResolution = { locale: SupportedLocale; source: LocaleSource };

export function localeFromPath(pathname: string): SupportedLocale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isSupportedLocale(segment) ? segment : null;
}

export function browserLocale(languages: readonly string[] = navigator.languages): SupportedLocale | null {
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if (isSupportedLocale(base)) return base;
  }
  return null;
}

export function resolveLocale(pathname = window.location.pathname): LocaleResolution {
  const url = localeFromPath(pathname);
  if (url) return { locale: url, source: "url" };
  const saved = readSavedLocale();
  if (saved) return { locale: saved, source: "user_selection" };
  const browser = browserLocale();
  if (browser) return { locale: browser, source: "browser" };
  return { locale: "en", source: "fallback" };
}

export function localizePath(pathname: string, locale: SupportedLocale) {
  const current = localeFromPath(pathname);
  const unprefixed = current ? pathname.replace(new RegExp(`^/${current}(?=/|$)`), "") || "/" : pathname;
  return `/${locale}${unprefixed === "/" ? "/" : unprefixed}`.replace(/\/{2,}/g, "/");
}
