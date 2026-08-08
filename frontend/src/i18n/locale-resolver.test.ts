import { describe, expect, it, vi } from "vitest";
import { browserLocale, localeFromPath, localizePath, resolveLocale } from "./locale-resolver";

describe("locale resolution", () => {
  it("accepts only supported URL locales", () => {
    expect(localeFromPath("/es/industries/logistics-ai")).toBe("es");
    expect(localeFromPath("/pt/contact")).toBeNull();
  });
  it("selects the first supported browser language", () => {
    expect(browserLocale(["de-DE", "fr-CA", "en-US"])).toBe("fr");
  });
  it("changes only the locale prefix", () => {
    expect(localizePath("/en/industries/legal-ai", "fr")).toBe("/fr/industries/legal-ai");
    expect(localizePath("/book-demo", "es")).toBe("/es/book-demo");
  });
  it("uses URL before saved and browser preferences", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fr");
    expect(resolveLocale("/es/contact")).toEqual({locale:"es",source:"url"});
    vi.restoreAllMocks();
  });
});
