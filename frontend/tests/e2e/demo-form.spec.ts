import { expect, test } from "@playwright/test";

const viewports = [
  { width: 375, height: 812 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function openDemo(page: import("@playwright/test").Page) {
  await page.goto("/ai-receptionist");
  await page.getByRole("button", { name: "Decline" }).click().catch(() => {});
  const opener = page.getByRole("button", { name: "Book a Live Demo" }).first();
  await opener.click();
  return { dialog: page.getByRole("dialog"), opener };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/analytics/events", (route) =>
    route.fulfill({ status: 202, contentType: "application/json", body: "{}" }),
  );
});

for (const viewport of viewports) {
  test(`demo modal is usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const { dialog } = await openDemo(page);
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + Math.min(box!.height, viewport.height)).toBeLessThanOrEqual(viewport.height + 1);
    await expect(dialog.getByRole("heading", { name: "Book a Live Demo" })).toBeVisible();
    const honeypot = dialog.locator('input[name="honeypot"]');
    await expect(honeypot.locator("xpath=..")).toHaveAttribute("aria-hidden", "true");
    const honeypotBox = await honeypot.boundingBox();
    expect(honeypotBox?.width ?? 0).toBeLessThanOrEqual(1);
    expect(honeypotBox?.height ?? 0).toBeLessThanOrEqual(1);
    await dialog.getByLabel("Full name").fill("Demo User");
    await dialog.getByLabel("Business name").fill("Codestra Test");
    await dialog.getByLabel("Work email").fill("demo@example.com");
    await dialog.getByLabel("Phone number").fill("+13465550199");
    await dialog.getByLabel("Country").selectOption("US");
    await dialog.getByLabel("Preferred language").selectOption("es");
    await dialog.getByLabel("Industry").selectOption("real_estate");
    await dialog.getByLabel("Employees or agents").selectOption("11-50");
    await dialog.getByLabel("Monthly call volume").selectOption("500-1000");
    await dialog.getByLabel("Product interest").selectOption("ai_receptionist_odoo");
    await dialog.getByLabel("Preferred demo date").fill("2026-08-20");
    await dialog.getByLabel("Preferred demo time").fill("14:30");
    await dialog.getByLabel("Message").fill("Please demonstrate the scheduling workflow.");
    await dialog.getByLabel(/I agree to the Privacy Policy/).check();
    await expect(dialog.getByLabel("Preferred demo date")).toHaveValue("2026-08-20");
    await expect(dialog.getByLabel("Preferred demo time")).toHaveValue("14:30");
  });
}

test("focus is trapped, Escape closes, and focus returns", async ({ page }) => {
  const { dialog, opener } = await openDemo(page);
  await expect(dialog.getByRole("heading", { name: "Book a Live Demo" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Close demo form" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("validation remains visible and successful submission fires once with context", async ({ page }) => {
  let submissionCount = 0;
  let submittedBody: Record<string, unknown> = {};
  await page.route("**/api/v1/demo-requests", async (route) => {
    submissionCount += 1;
    submittedBody = route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ status: "queued", request_id: "demo-form-test" }),
    });
  });
  const { dialog } = await openDemo(page);
  await dialog.getByRole("button", { name: "Book a Live Demo" }).click();
  await expect(dialog.getByText("Full name is required.")).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Full name").fill("Demo User");
  await dialog.getByLabel("Business name").fill("Codestra Test");
  await dialog.getByLabel("Work email").fill("demo@example.com");
  await dialog.getByLabel("Phone number").fill("+13465550199");
    await dialog.getByLabel("Country").selectOption("US");
    await dialog.getByLabel("Industry").selectOption("real_estate");
  await dialog.getByLabel("Employees or agents").selectOption("11-50");
  await dialog.getByLabel("Monthly call volume").selectOption("500-1000");
  await dialog.getByLabel(/I agree to the Privacy Policy/).check();
  const submit = dialog.locator('button[type="submit"]');
  await submit.dblclick();
  await expect(submit).toBeDisabled();
  await expect(dialog.getByRole("status")).toContainText("received successfully");
  expect(submissionCount).toBe(1);
  expect(submittedBody.industry).toBe("real_estate");
  expect(submittedBody.cta_clicked).toBe("Book a Live Demo");
  expect(submittedBody.attribution).toBeTruthy();
  await expect(page).toHaveURL(/thank-you\?request_id=demo-form-test/);
});

test("server errors remain visible and permit retry", async ({ page }) => {
  await page.route("**/api/v1/demo-requests", (route) =>
    route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ message: "Please review the submitted details." }) }),
  );
  const { dialog } = await openDemo(page);
  await dialog.getByLabel("Full name").fill("Demo User");
  await dialog.getByLabel("Business name").fill("Codestra Test");
  await dialog.getByLabel("Work email").fill("demo@example.com");
  await dialog.getByLabel("Phone number").fill("+13465550199");
  await dialog.getByLabel("Country").selectOption("US");
  await dialog.getByLabel("Industry").selectOption("real_estate");
  await dialog.getByLabel("Employees or agents").selectOption("11-50");
  await dialog.getByLabel("Monthly call volume").selectOption("500-1000");
  await dialog.getByLabel(/I agree to the Privacy Policy/).check();
  await dialog.getByRole("button", { name: "Book a Live Demo" }).click();
  await expect(dialog.getByRole("alert").filter({ hasText: "Please review" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Book a Live Demo" })).toBeEnabled();
});
