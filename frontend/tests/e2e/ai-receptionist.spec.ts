import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/analytics/events", (route) =>
    route.fulfill({ status: 202, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/ai-receptionist");
  await page
    .getByRole("button", { name: "Decline" })
    .click()
    .catch(() => {});
});

test("page navigation, calculator, tabs, FAQ and CTA work", async ({
  page,
}) => {
  await expect(page.locator("h1.ai-typing-title")).toBeVisible();
  await expect(page.locator("h1.ai-typing-title")).toHaveAttribute("aria-label", "Never Miss Another Customer Call");
  await expect(page.getByRole("link", { name: "Call the AI Now" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "See Plans and Pricing" })).toHaveAttribute("href", "/en/pricing#pricing");
  await page
    .getByRole("button", { name: "Calculate My Missed-Call Cost" })
    .click();
  await expect(page.getByText("$16,800")).toBeVisible();
  await page.getByRole("tab", { name: "Call centers" }).click();
  await expect(
    page.getByText("Add intelligent coverage to every campaign"),
  ).toBeVisible();
  const faq = page.getByRole("button", { name: "What is an AI receptionist?" });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Book a Live Demo" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("has no serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).include("main").analyze();
  expect(
    results.violations.filter((item) =>
      ["critical", "serious"].includes(item.impact || ""),
    ),
  ).toEqual([]);
});

test("mobile navigation manages focus and Escape", async ({ page }) => {
  test.skip(
    (page.viewportSize()?.width ?? 1000) > 900,
    "mobile and tablet only",
  );
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Navigation menu" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Navigation menu" }),
  ).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("captures a valid mock lead submission", async ({ page }) => {
  await page.route("**/api/v1/demo-requests", (route) =>
    route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ status: "queued", request_id: "demo" }),
    }),
  );
  await page.getByRole("button", { name: "Book a Live Demo" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Test User");
  await dialog.getByLabel("Business name").fill("Test Business");
  await dialog.getByLabel("Work email").fill("test@example.com");
  await dialog.getByLabel("Phone number").fill("+13465550199");
  await dialog.getByLabel("Country").selectOption("United States");
  await dialog.getByLabel("Industry").selectOption("logistics");
  await dialog.getByLabel("Employees or agents").selectOption("11-50");
  await dialog.getByLabel("Monthly call volume").selectOption("500-1000");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: /Submit|Book/i }).click();
  await expect(page).toHaveURL(/thank-you/);
});
