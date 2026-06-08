const { test, expect } = require("@playwright/test");

const APP_BASE = "";
const appPath = (route = "/") => `${APP_BASE}${route}`;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.setItem("gateqa_domain_shift_notice_seen_v2", "1");
  });
});

async function openMockPortal(page) {
  await page.goto(appPath("/"));
  await expect(page.getByRole("button", { name: /Mock Test/i })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: /Mock Test/i }).click();
  await expect(page).toHaveURL(/\/mock\?stage=setup/, { timeout: 15000 });
}

async function continueToFullMockSetup(page) {
  await openMockPortal(page);
  await expect(page.getByTestId("mock-portal-option-full_length")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("mock-portal-continue").click();
  await expect(page.getByRole("heading", { name: /mock test setup/i })).toBeVisible({
    timeout: 15000,
  });
}

test("mock card is visible on the landing page", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("button", { name: /Mock Test/i })).toBeVisible({
    timeout: 15000,
  });
});

test("insights entry is visible on the landing page", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("button", { name: /Performance Insights/i })).toBeVisible({
    timeout: 15000,
  });
});

test("mock portal route loads from the landing CTA", async ({ page }) => {
  await openMockPortal(page);
  await expect(page.getByText("Past Paper")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("mock-portal-continue")).toBeVisible({ timeout: 15000 });
});

test("continuing from the mock portal opens the setup screen", async ({ page }) => {
  await continueToFullMockSetup(page);
  await expect(page.getByRole("button", { name: /start mock/i })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText(/no setup noise here/i)).toBeVisible({ timeout: 15000 });
});

test("starting a full mock shows the exam shell", async ({ page }) => {
  await continueToFullMockSetup(page);

  const startButton = page.getByRole("button", { name: /start mock/i });
  await expect(startButton).toBeEnabled({ timeout: 15000 });
  await startButton.click();

  await expect(page).toHaveURL(/\/mock\?stage=exam/, { timeout: 15000 });
  await expect(page.getByTestId("mock-timer-value")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: /instructions/i })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("button", { name: /save & next/i })).toBeVisible({
    timeout: 15000,
  });
});

test("insights page loads from the landing CTA", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("button", { name: /Performance Insights/i })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: /Performance Insights/i }).click();

  await expect(page).toHaveURL(/\/insights/, { timeout: 15000 });
  await expect(page.locator("div.bg-sky-50:has-text('Insights')")).toBeVisible({
    timeout: 15000,
  });
});
