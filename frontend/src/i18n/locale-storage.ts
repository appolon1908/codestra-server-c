import type { SupportedLocale } from "./locale-types";
import { isSupportedLocale } from "./locale-types";

const STORAGE_KEY = "codestra.locale";

export function readSavedLocale(): SupportedLocale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isSupportedLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveLocale(locale: SupportedLocale) {
  try { window.localStorage.setItem(STORAGE_KEY, locale); } catch { /* storage can be unavailable */ }
}
