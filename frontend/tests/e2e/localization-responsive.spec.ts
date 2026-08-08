import { expect, test } from "@playwright/test";

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

const routes = [
  ["en", "/en/ai-receptionist"],
  ["es", "/es/book-demo?utm_source=responsive-qa"],
  ["fr", "/fr/industries/logistics-ai"],
  ["en", "/en/industries/education-ai"],
] as const;

test("all locales wrap without overflow at required responsive widths", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const [locale, route] of routes) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      expect(dimensions.content, `${route} at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(runtimeErrors.splice(0), `${route} emitted runtime errors`).toEqual([]);
    }
  }
});
