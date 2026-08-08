import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/analytics/events", (route) => route.fulfill({ status: 202, contentType: "application/json", body: "{}" }));
});

test("industry directory exposes all 25 available solutions with searchable filters", async ({ page }) => {
  await page.goto("/industries");
  await expect(page.getByRole("heading", { name: /AI Workflows Built/ })).toBeVisible();
  await expect(page.getByText(/Showing 25 of 25 industries/)).toBeVisible();
  await page.getByLabel("Search industries").fill("dental");
  await expect(page.getByText("Dental practices", { exact: true })).toBeVisible();
  await expect(page.getByText(/Showing 1 of 25 industries/)).toBeVisible();
  await expect(page).toHaveURL(/q=dental/);
  await page.getByLabel("Search industries").fill("");
  const filterToggle = page.getByRole("button", { name: "Filter industries" });
  if (await filterToggle.isVisible()) await filterToggle.click();
  await page.getByRole("button", { name: "Healthcare and Care" }).click();
  await expect(page).toHaveURL(/category=Healthcare/);
  if (await filterToggle.isVisible()) await filterToggle.click();
  await page.getByRole("button", { name: "All" }).click();
  await page.getByRole("link", { name: "Explore Logistics AI" }).click();
  await expect(page).toHaveURL(/industries\/logistics-ai/);
});

test("logistics scenario, calculator, workflow and contextual CTAs work", async ({ page }) => {
  await page.goto("/industries/logistics-ai");
  await expect(page.getByRole("heading", { name: "Keep Every Shipment Conversation Moving" })).toBeVisible();
  await page.getByRole("tab", { name: "Pickup scheduling" }).click();
  await expect(page.getByText("Pickup request prepared for dispatch review.")).toBeVisible();
  await page.getByLabel("Monthly inquiries").fill("1000");
  await page.getByLabel("Percent missed").fill("20");
  await expect(page.getByText("200", { exact: true })).toBeVisible();
  const demo = page.locator(".industry-hero").getByRole("link", { name: "Request an Industry Demo" });
  await expect(demo).toHaveAttribute("href", /industry=logistics&solution=logistics_ai_platform&cta=hero/);
  await demo.click();
  await expect(page.getByLabel("Industry")).toHaveValue("logistics");
});

test("request pricing submits once through the canonical endpoint", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/v1/pricing-requests", (route) => {
    calls += 1;
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ request_id: "pricing-test", status: "queued" }) });
  });
  await page.goto("/request-pricing?industry=logistics&solution=logistics_ai_platform&cta=pricing");
  await page.getByLabel("Full name").fill("Pricing User");
  await page.getByLabel("Business name").fill("Pricing Company");
  await page.getByLabel("Work email").fill("pricing@example.com");
  await page.getByLabel("Phone number").fill("+13465550199");
  await page.getByLabel("Country").selectOption("United States");
  await page.getByLabel("Employees or agents").selectOption("11-50");
  await page.getByLabel("Monthly call volume").selectOption("500-1000");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request Pricing" }).dblclick();
  await expect(page.getByRole("status")).toContainText("received successfully");
  expect(calls).toBe(1);
});

test("new industry CTA preserves context and reveals progressive qualification", async ({ page }) => {
  await page.goto("/industries/education-ai");
  await page.getByRole("link", { name: "Modernize Your Student Experience" }).click();
  await expect(page).toHaveURL(/book-demo\?industry=education&solution=education_ai_platform&cta=hero/);
  await expect(page.getByLabel("Industry")).toHaveValue("education");
  await expect(page.getByLabel("Institution type")).toBeVisible();
  await expect(page.getByLabel("Number of students")).toBeVisible();
  await expect(page.locator('input[name="honeypot"]')).toHaveCount(1);
  await expect(page.locator('input[name="honeypot"]').locator("xpath=..")).toHaveAttribute("aria-hidden", "true");
});

const industryRoutes = [
  ["logistics-ai", "Keep Every Shipment Conversation Moving"], ["legal-ai", "Capture Every Potential Client—Day or Night"],
  ["healthcare-ai", "Give Patients Secure, Convenient Access to Your Practice"], ["senior-care-ai", "Coordinate Care, Transportation and Family Communication"],
  ["real-estate-ai", "Convert More Property Inquiries Into Appointments"], ["financial-services-ai", "Respond Faster While Keeping Financial Workflows Controlled"],
  ["ecommerce-ai", "Turn Product Questions Into Completed Orders"], ["hospitality-ai", "Serve Every Guest Before, During and After Their Stay"],
  ["construction-ai", "Turn Service Calls Into Scheduled Jobs"], ["agriculture-ai", "Make Faster Decisions Across Your Farm and Supply Chain"],
  ["education-ai", "Support Every Student From Enrollment to Completion"], ["dental-ai", "Fill Your Schedule Without Missing Patient Calls"],
  ["veterinary-ai", "Help Pet Owners Reach Your Practice Anytime"], ["automotive-ai", "Turn Vehicle Inquiries Into Appointments and Sales"],
  ["restaurant-ai", "Serve More Customers Without Missing Orders or Reservations"], ["manufacturing-ai", "Connect Production, Quality and Customer Operations"],
  ["recruitment-ai", "Move Qualified Candidates Through Hiring Faster"], ["nonprofit-ai", "Serve More People With Connected Digital Operations"],
  ["public-services-ai", "Make Public Information and Services Easier to Access"], ["energy-ai", "Connect Customer Service, Field Work and Energy Operations"],
  ["telecom-it-ai", "Resolve Requests Faster and Keep Customers Connected"], ["wellness-ai", "Keep Your Schedule Full and Your Clients Engaged"],
  ["security-services-ai", "Respond Faster From Sales Inquiry to Service Dispatch"], ["marketing-media-ai", "Create, Approve and Measure Campaigns Faster"],
  ["gaming-entertainment-ai", "Create Better Player and Audience Experiences"],
] as const;

for (const [route, headline] of industryRoutes) {
  test(`${route} renders unique complete content without overflow`, async ({ page }) => {
    await page.goto(`/industries/${route}`);
    await expect(page.getByRole("heading", { name: headline })).toBeVisible();
    await expect(page.getByRole("heading", { name: "From Inquiry to the Right Team" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Questions$/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("logistics canary has no serious accessibility violations", async ({ page }) => {
  await page.goto("/industries/logistics-ai");
  await expect(page.getByRole("heading", { name: "Keep Every Shipment Conversation Moving" })).toBeVisible();
  const results = await new AxeBuilder({ page }).include("main").analyze();
  expect(results.violations.filter((item) => ["critical", "serious"].includes(item.impact || ""))).toEqual([]);
});
