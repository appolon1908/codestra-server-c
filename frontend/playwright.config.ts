import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: "list",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "npm run serve:prerendered -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "mobile",
      use: {
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "wide", use: { viewport: { width: 1920, height: 1080 } } },
    {
      name: "firefox-form",
      testMatch: ["demo-form.spec.ts", "industry-responsive.spec.ts", "industry-expansion-responsive.spec.ts", "industry-platform.spec.ts", "localization.spec.ts", "localization-responsive.spec.ts"],
      use: { browserName: "firefox", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "webkit-form",
      testMatch: ["demo-form.spec.ts", "industry-responsive.spec.ts", "industry-expansion-responsive.spec.ts", "industry-platform.spec.ts", "localization.spec.ts", "localization-responsive.spec.ts"],
      use: { browserName: "webkit", viewport: { width: 1440, height: 900 } },
    },
  ],
});
