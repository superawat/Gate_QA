const { test, expect } = require("@playwright/test");
const { getSampleQuestion } = require("./helpers");

const APP_BASE = "/Gate_QA";
const appPath = (route = "/") => `${APP_BASE}${route}`;

async function waitForPracticeList(page) {
  await expect(
    page.getByRole("heading", { name: /Choose a question directly/i })
  ).toBeVisible({ timeout: 15000 });
}

test("landing page loads without runtime errors", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message || String(error));
  });

  await page.goto(appPath("/"));
  await expect(page.getByRole("link", { name: /GATE QA home/i })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("random practice opens a solve route", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("button", { name: /Random Practice/i })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: /Random Practice/i }).click();
  await expect(page).toHaveURL(/\/Gate_QA\/practice\/question\/.+/);
  await expect(page.getByText(/Solve/i)).toBeVisible();
});

test("subject filter updates result context", async ({ page }) => {
  await page.goto(appPath("/practice"));
  await waitForPracticeList(page);

  const subjectCheckbox = page.getByRole("checkbox", { name: "Algorithms", exact: true });
  await expect(subjectCheckbox).toBeVisible({ timeout: 15000 });
  await subjectCheckbox.check();

  await expect(page).toHaveURL(/subjects=algorithms/);
  await expect(subjectCheckbox).toBeChecked();
});

test("search input filters and can be cleared", async ({ page }) => {
  await page.goto(appPath("/practice"));
  await waitForPracticeList(page);
  const searchInput = page.getByLabel(/Search the current pool/i);
  await expect(searchInput).toBeVisible({ timeout: 15000 });
  await searchInput.fill("zzzz-no-match-token");

  await expect(page.getByText(/No questions match these filters/i)).toBeVisible();
  await searchInput.fill("");
  await waitForPracticeList(page);
});

test("deep-link question route opens the requested uid", async ({ page }) => {
  const sampleQuestion = getSampleQuestion();
  const encodedUid = encodeURIComponent(sampleQuestion.question_uid);

  await page.goto(appPath(`/practice/question/${encodedUid}`));
  await expect(page).toHaveURL(new RegExp(`/Gate_QA/practice/question/${encodedUid}`));
  await expect(page.getByText("Question not found.")).toHaveCount(0);
});

test("share button copies a deep-link URL", async ({ context, page }) => {
  const sampleQuestion = getSampleQuestion();
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });

  await page.goto(appPath(`/practice/question/${encodeURIComponent(sampleQuestion.question_uid)}`));
  await page.getByRole("button", { name: /Copy question link/i }).click();
  await expect(page.getByText("Link copied!")).toBeVisible();

  const copiedText = await page.evaluate(async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.readText !== "function") {
      return "";
    }
    return navigator.clipboard.readText();
  });

  expect(copiedText).toContain("?question=");
  expect(copiedText).toContain("/practice/question/");
});
