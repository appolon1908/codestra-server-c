import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("SEO remediation browser checks", () => {
  test("navigation, CTA, language switching, consent and unknown routes", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /get in touch|start a project/i })).toHaveAttribute("href", /\/en\/contact/);
    const menu = page.getByRole("button", { name: /open.*menu/i });
    let menuOpened = false;
    if (await menu.isVisible()) {
      await menu.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#global-mobile-menu")).toBeVisible();
      menuOpened = true;
    }
    const language = page.locator("#header-language");
    if (await language.isVisible()) await language.selectOption("es");
    else await page.locator("#mobile-language").selectOption("es");
    await expect(page).toHaveURL(/\/es\//);
    if (menuOpened) {
      await page.keyboard.press("Escape");
      await expect(page.locator("#global-mobile-menu")).toHaveCount(0);
    }
    await page.goto("/en/contact");
    const consent = page.locator('input[type="checkbox"]').first();
    if (await consent.count()) await expect(consent).not.toBeChecked();
    const missing = await page.goto("/en/not-a-real-route");
    expect(missing?.status()).toBe(404);
  });

  test("services and industries dropdowns support keyboard operation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/");
    const services = page.getByRole("button", { name: "Services" }).first();
    await services.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "AI Automation" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("link", { name: "AI Automation" })).toHaveCount(0);
    const industries = page.getByRole("button", { name: "Industries" }).first();
    await industries.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "View all industries" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("link", { name: "View all industries" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Healthcare" })).toHaveAttribute("href", "/en/industries/healthcare-ai");
  });

  test("localized sales and portal utility routes are prerendered and accessible", async ({ page }) => {
    for (const route of ["sales", "portal"]) {
      const response = await page.goto(`/en/${route}/`);
      expect(response?.status(), `${route} static response`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
      expect(serious, `${route} accessibility violations`).toEqual([]);
    }
  });

  test("responsive layout has no serious accessibility violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [360, 390, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: width < 500 ? 812 : 900 });
      await page.goto("/en/");
      await expect(page.locator("h1")).toHaveCount(1);
      await page.waitForTimeout(250);
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
      expect(serious, `${width}px accessibility violations`).toEqual([]);
    }
  });
});
