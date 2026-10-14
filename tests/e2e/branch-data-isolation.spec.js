const { test, expect } = require("@playwright/test");

const APP_BASE = "";
const appPath = (route = "/") => `${APP_BASE}${route}`;

test.describe("Selected-Branch-Only Data Loading and Storage Isolation", () => {
  test("initial onboarding with CSE + EC loads only CSE and EC, blocking DA, EE, ME, CE, and aptitude", async ({ page }) => {
    const requestedUrls = [];
    page.on("request", (req) => {
      requestedUrls.push(req.url());
    });

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

    // CSE is already selected by default; select EC as 2nd paper
    const ecCard = page.getByTestId("branch-wall-card-ec");
    await ecCard.click();

    // Confirm selection
    const confirmButton = page.getByRole("button", { name: /Confirm & Start Preparing/i });
    await confirmButton.click();
    await expect(wallHeading).not.toBeVisible({ timeout: 5000 });

    // Navigate to practice page to trigger data loads for selected branches
    await page.goto(appPath("/practice"));
    await page.waitForTimeout(2000);

    // Verify unselected branch search indices and aptitude were NOT loaded
    const hasDaRequest = requestedUrls.some((u) => u.includes("/data/da/") || u.includes("mock_catalog_da_v1.json"));
    const hasEeRequest = requestedUrls.some((u) => u.includes("/data/ee/"));
    const hasMeRequest = requestedUrls.some((u) => u.includes("/data/me/"));
    const hasCeRequest = requestedUrls.some((u) => u.includes("/data/ce/"));
    const hasAptitudeRequest = requestedUrls.some((u) => u.includes("aptitude-search-index.json"));

    expect(hasDaRequest, "DA data must not be requested").toBe(false);
    expect(hasEeRequest, "EE data must not be requested").toBe(false);
    expect(hasMeRequest, "ME data must not be requested").toBe(false);
    expect(hasCeRequest, "CE data must not be requested").toBe(false);
    expect(hasAptitudeRequest, "General Aptitude data must not be requested during initial onboarding").toBe(false);
  });

  test("profile branch change from CSE+EC to CSE+ME purges EC and loads ME without data loss", async ({ page }) => {
    // Setup initial state: CSE + EC with user progress
    await page.addInitScript(() => {
      window.localStorage.setItem("gateqa_domain_shift_notice_seen_v2", "1");
      window.localStorage.setItem("gateqa_auth_announcement_seen_v1", "1");
      window.localStorage.setItem("gateqa_da_questions_announcement_seen_v1", "1");
      window.localStorage.setItem("gateqa_tracker_announcement_seen_v1", "true");
      window.localStorage.setItem("gateqa_branch_onboarding_completed", "true");
      window.localStorage.setItem("gateqa_selected_branches", JSON.stringify(["cse", "ec"]));
      window.localStorage.setItem("gateqa_active_branch", "cse");
      window.localStorage.setItem("gateqa_include_ec", "true");
      window.localStorage.setItem("gate_qa_solved_questions", JSON.stringify(["ec:2024:set-1:q1", "go:100"]));
    });

    const requestedUrls = [];
    page.on("request", (req) => {
      requestedUrls.push(req.url());
    });

    await page.goto(appPath("/profile"));
    await expect(page.getByRole("heading", { name: /GATE Aspirant Hub/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Enrolled GATE Disciplines/i })).toBeVisible();

    // Deselect EC and select ME directly in Candidate Profile Hub
    const ecCard = page.getByTestId("profile-discipline-ec");
    const meCard = page.getByTestId("profile-discipline-me");

    await ecCard.click(); // Deselect EC
    await meCard.click(); // Select ME
    await page.waitForTimeout(1000);

    // Verify storage cleanup: EC toggle removed, ME and CSE stored
    const storedBranches = await page.evaluate(() => JSON.parse(window.localStorage.getItem("gateqa_selected_branches") || "[]"));
    expect(storedBranches).toEqual(["cse", "me"]);

    const ecInclude = await page.evaluate(() => window.localStorage.getItem("gateqa_include_ec"));
    expect(ecInclude).toBeNull();

    // Verify user study progress is preserved
    const solved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("gate_qa_solved_questions") || "[]"));
    expect(solved).toEqual(["ec:2024:set-1:q1", "go:100"]);

    // Navigate to practice to trigger ME loading
    await page.goto(appPath("/practice"));
    await page.waitForTimeout(2000);

    // Verify ME index requested, DA/EE/CE remained unloaded
    const hasMeRequest = requestedUrls.some((u) => u.includes("/data/me/search-index.json"));
    const hasDaRequest = requestedUrls.some((u) => u.includes("/data/da/"));
    const hasEeRequest = requestedUrls.some((u) => u.includes("/data/ee/"));
    const hasCeRequest = requestedUrls.some((u) => u.includes("/data/ce/"));

    expect(hasMeRequest, "ME data should be loaded").toBe(true);
    expect(hasDaRequest, "DA data must not be loaded").toBe(false);
    expect(hasEeRequest, "EE data must not be loaded").toBe(false);
    expect(hasCeRequest, "CE data must not be loaded").toBe(false);
  });
});
