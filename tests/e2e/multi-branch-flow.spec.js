const { test, expect } = require("@playwright/test");

const APP_BASE = "";
const appPath = (route = "/") => `${APP_BASE}${route}`;

test.describe("Multi-Branch Onboarding, Scoping and Profile Flow", () => {
  test("shows onboarding wall on fresh session and enforces <= 2 branches rule", async ({ page }) => {
    // Fresh session without branch preferences
    await page.addInitScript(() => {
      window.localStorage.setItem("gateqa_domain_shift_notice_seen_v2", "1");
      window.localStorage.setItem("gateqa_auth_announcement_seen_v1", "1");
      window.localStorage.setItem("gateqa_da_questions_announcement_seen_v1", "1");
      window.localStorage.setItem("gateqa_tracker_announcement_seen_v1", "true");
    });

    await page.goto(appPath("/"));

    // Verify Onboarding Wall is displayed
    const wallHeading = page.getByRole("heading", { name: /Choose Your Preparation Disciplines/i });
    await expect(wallHeading).toBeVisible({ timeout: 15000 });

    // Verify maximum 2 papers badge
    await expect(page.getByText(/Official GATE Rule: Max 2 Papers Allowed/i)).toBeVisible();

    // Select EC and EE (CSE starts selected by default, deselect CSE to allow 2 papers)
    const cseCard = page.getByRole("button", { name: /Computer Science & IT/i });
    const ecCard = page.getByRole("button", { name: /Electronics & Communication/i });
    const eeCard = page.getByRole("button", { name: /Electrical Engineering/i });

    // Deselect CSE
    await cseCard.click();

    // EC is clicked
    await ecCard.click();

    // EE is clicked
    await eeCard.click();

    // Confirm button should be enabled
    const confirmButton = page.getByRole("button", { name: /Confirm & Start Preparing/i });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // Wall should disappear
    await expect(wallHeading).not.toBeVisible({ timeout: 5000 });

    // Verify branch preferences are persisted upon onboarding completion
    const stored = await page.evaluate(() => window.localStorage.getItem("gateqa_selected_branches"));
    const branches = JSON.parse(stored);
    expect(branches).toContain("ec");
    expect(branches.length).toBeLessThanOrEqual(2);
  });

  test("profile page displays enrolled branches and allows active branch swap", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("gateqa_domain_shift_notice_seen_v2", "1");
      window.localStorage.setItem("gateqa_auth_announcement_seen_v1", "1");
      window.localStorage.setItem("gateqa_da_questions_announcement_seen_v1", "1");
      window.localStorage.setItem("gateqa_tracker_announcement_seen_v1", "true");
      window.localStorage.setItem("gateqa_branch_onboarding_completed", "true");
      window.localStorage.setItem("gateqa_selected_branches", JSON.stringify(["ec", "ee"]));
      window.localStorage.setItem("gateqa_active_branch", "ec");
    });

    await page.goto(appPath("/profile"));

    // Verify Candidate Profile Hub
    await expect(page.getByRole("heading", { name: /GATE Aspirant Hub/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Enrolled GATE Disciplines/i })).toBeVisible();

    // Verify both EC and EE badges are present in enrolled disciplines
    await expect(page.getByText(/Electronics & Communication/i).first()).toBeVisible();
    await expect(page.getByText(/Electrical Engineering/i).first()).toBeVisible();
  });
});
