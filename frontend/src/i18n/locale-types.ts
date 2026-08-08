export const supportedLocales = ["en", "es", "fr"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export type LocaleSource = "url" | "user_selection" | "browser" | "country_suggestion" | "fallback";

export const localeNames: Record<SupportedLocale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  typeof value === "string" && supportedLocales.includes(value as SupportedLocale);
