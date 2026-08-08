import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/case-studies",
  "/contact",
  "/contact/sales",
  "/contact/support",
  "/electronic-billing",
  "/electronic-billing/form",
  "/hiring/positions",
  "/services",
  "/privacy",
  "/ai-receptionist",
  "/pricing",
  "/book-demo",
  "/security",
  "/terms",
  "/thank-you",
  "/industries",
  "/industries/logistics-ai",
  "/request-pricing",
] as const;

test("all public routes fit mobile and tablet viewports", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1200) > 768, "responsive matrix");
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  for (const route of publicRoutes) {
    await page.goto(route, { waitUntil: "networkidle" });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(
      dimensions.content,
      `${route} has horizontal overflow`,
    ).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(runtimeErrors.splice(0), `${route} emitted runtime errors`).toEqual(
      [],
    );
  }
});
