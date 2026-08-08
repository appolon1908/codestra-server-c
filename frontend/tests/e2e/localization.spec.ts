import { expect, test } from "@playwright/test";

test("nonlocalized deep links redirect once and preserve UTM values", async ({page}) => {
  await page.goto("/ai-receptionist?utm_source=test&utm_campaign=i18n");
  await expect(page).toHaveURL(/\/(en|es|fr)\/ai-receptionist\?utm_source=test&utm_campaign=i18n$/);
});

test("removed Haitian Creole routes redirect to the English equivalent", async ({ page }) => {
  await page.goto("/ht/ai-receptionist?utm_source=legacy");
  await expect(page).toHaveURL(/\/en\/ai-receptionist\?utm_source=legacy$/);
});

for (const [locale, headline] of [["en","Never Miss Another Customer Call"],["es","No vuelvas a perder una llamada de un cliente"],["fr","Ne manquez plus aucun appel client"]] as const) {
  test(`${locale} AI Receptionist has localized route, document language and heading`, async ({page}) => {
    await page.goto(`/${locale}/ai-receptionist`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("h1.ai-typing-title")).toHaveAttribute("aria-label", headline);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  });
}

test("language selector preserves page and query parameters", async ({page}) => {
  await page.goto("/en/industries/logistics-ai?utm_source=qa&gclid=safe-test");
  await page.locator("#footer-language").selectOption("fr");
  await expect(page).toHaveURL("/fr/industries/logistics-ai?utm_source=qa&gclid=safe-test");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("language switching preserves safe unsent form context without storing contact details", async ({ page }) => {
  await page.goto("/en/book-demo?utm_source=form-language-test");
  await page.locator('input[name="full_name"]').fill("Private Name");
  await page.locator('select[name="industry"]').selectOption("logistics");
  await page.locator('select[name="employee_count"]').selectOption("11-50");
  await page.locator('input[name="preferred_demo_date"]').fill("2026-08-20");
  await page.locator("#footer-language").selectOption("es");
  await expect(page).toHaveURL("/es/book-demo?utm_source=form-language-test");
  await expect(page.locator('select[name="industry"]')).toHaveValue("logistics");
  await expect(page.locator('select[name="employee_count"]')).toHaveValue("11-50");
  await expect(page.locator('input[name="preferred_demo_date"]')).toHaveValue("2026-08-20");
  await expect(page.locator('input[name="full_name"]')).toHaveValue("Private Name");
  const stored = await page.evaluate(() => sessionStorage.getItem("codestra.lead_form_context") ?? "");
  expect(stored).not.toContain("Private Name");
});

test("homepage shared navigation and hero react to locale changes", async ({page}) => {
  await page.goto("/es/");
  await expect(page.getByText("El desarrollo solía ser mágico", {exact:false})).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", {name:"Nosotros"})).toHaveAttribute("href", "/es/about");
  await page.locator("#footer-language").selectOption("fr");
  await expect(page).toHaveURL("/fr/");
  await expect(page.getByText("Le développement était autrefois magique", {exact:false})).toBeVisible();
});

test("conversion and AI section headings are localized", async ({page}) => {
  await page.goto("/fr/book-demo?utm_source=qa");
  await expect(page.getByRole("heading", {level:1,name:"Réserver une démo en direct"})).toBeVisible();
  await page.goto("/es/ai-receptionist");
  await expect(page.getByRole("heading", {level:2,name:"Convierte cada llamada entrante en una oportunidad"})).toBeVisible();
  await expect(page.getByRole("heading", {level:2,name:"Cada llamada merece una respuesta"})).toBeVisible();
});

for (const [locale, directoryTitle, workflowTitle] of [
  ["en", "AI Workflows Built Around How Your Industry Operates", "From Inquiry to the Right Team"],
  ["es", "Flujos de IA adaptados al funcionamiento de tu industria", "De la consulta al equipo adecuado"],
  ["fr", "Des flux IA adaptés au fonctionnement de votre secteur", "De la demande à la bonne équipe"],
] as const) {
  test(`${locale} industry directory and shared template chrome are localized`, async ({ page }) => {
    await page.goto(`/${locale}/industries`);
    await expect(page.getByRole("heading", { level: 1, name: directoryTitle })).toBeVisible();
    await page.goto(`/${locale}/industries/logistics-ai?utm_source=localization-qa`);
    await expect(page.getByRole("heading", { level: 2, name: workflowTitle })).toBeVisible();
    await expect(page).toHaveTitle(/Codestra/);
    await expect(page).not.toHaveTitle("Codestra Industry AI Solutions");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://codestra.co/${locale}/industries/logistics-ai`,
    );
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  });
}
