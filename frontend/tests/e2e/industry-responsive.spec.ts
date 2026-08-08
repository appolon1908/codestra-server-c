import { expect, test } from "@playwright/test";

const matrix = [
  [320, 568], [375, 812], [430, 932], [812, 375], [768, 1024], [1024, 768],
  [834, 1194], [1194, 834], [1366, 768], [1440, 900], [1920, 1080],
] as const;

test("logistics canary passes the complete responsive matrix", async ({ page }, testInfo) => {
  test.skip(!["desktop", "firefox-form", "webkit-form"].includes(testInfo.project.name), "one project per browser");
  for (const [width, height] of matrix) {
    await page.setViewportSize({ width, height });
    await page.goto("/industries/logistics-ai", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Keep Every Shipment Conversation Moving" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, `${width}x${height} overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
    await page.getByRole("tab", { name: "Pickup scheduling" }).click();
    await expect(page.getByText("Pickup request prepared for dispatch review.")).toBeVisible();
    if (width < 768) {
      await page.evaluate(() => window.scrollTo(0, 900));
      await expect(page.getByRole("complementary", { name: "Transportation and logistics demo" })).toBeVisible();
      await page.getByRole("button", { name: "Dismiss demo bar" }).click();
      await expect(page.getByRole("complementary", { name: "Transportation and logistics demo" })).toBeHidden();
    }
  }
});
