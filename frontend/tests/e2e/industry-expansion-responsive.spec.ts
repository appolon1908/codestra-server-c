import { expect, test } from "@playwright/test";

const routes = ["education-ai","dental-ai","veterinary-ai","automotive-ai","restaurant-ai","manufacturing-ai","recruitment-ai","nonprofit-ai","public-services-ai","energy-ai","telecom-it-ai","wellness-ai","security-services-ai","marketing-media-ai","gaming-entertainment-ai"];
const matrix = [[320,568],[375,812],[430,932],[812,375],[768,1024],[1024,768],[834,1194],[1194,834],[1366,768],[1440,900],[1920,1080]] as const;

test("all 15 expansion pages pass the complete responsive matrix", async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  test.skip(!["desktop", "firefox-form", "webkit-form"].includes(testInfo.project.name), "one matrix run per browser engine");
  for (const route of routes) for (const [width, height] of matrix) {
    await page.setViewportSize({ width, height });
    await page.goto(`/industries/${route}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    const layout = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(layout.content, `${route} ${width}x${height} overflow`).toBeLessThanOrEqual(layout.viewport + 1);
    await expect(page.locator("footer")).toBeVisible();
  }
});
