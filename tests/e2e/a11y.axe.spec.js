const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { getSampleQuestion } = require("./helpers");

const APP_BASE = "/Gate_QA";
const appPath = (route = "/") => `${APP_BASE}${route}`;

async function waitForPracticeList(page) {
  await expect(
    page.getByRole("heading", { name: /Choose a question directly/i })
  ).toBeVisible({ timeout: 15000 });
}

async function expectNoA11yViolations(page, routeLabel) {
  const analysis = await new AxeBuilder({ page }).analyze();
  const highImpactViolations = analysis.violations.filter((violation) =>
    ["critical", "serious"].includes(String(violation.impact || "").toLowerCase())
  );

  expect(
    highImpactViolations,
    `${routeLabel} has serious/critical axe violations: ${highImpactViolations
      .map((violation) => violation.id)
      .join(", ")}`
  ).toEqual([]);
}

test("axe audit: landing route", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("link", { name: /GATE QA home/i })).toBeVisible();
  await expectNoA11yViolations(page, "Landing");
});

test("axe audit: explore route", async ({ page }) => {
  await page.goto(appPath("/practice"));
  await waitForPracticeList(page);
  await page.waitForFunction(() => {
    const handles = Array.from(document.querySelectorAll(".rc-slider-handle[role='slider']"));
    return (
      handles.length >= 2 &&
      handles.every((handle) => {
        const label = handle.getAttribute("aria-label");
        const labelledBy = handle.getAttribute("aria-labelledby");
        const title = handle.getAttribute("title");
        return Boolean((label && label.trim()) || (labelledBy && labelledBy.trim()) || (title && title.trim()));
      })
    );
  });
  await expectNoA11yViolations(page, "Explore");
});

test("axe audit: solve route", async ({ page }) => {
  const sampleQuestion = getSampleQuestion();
  await page.goto(appPath(`/practice/question/${encodeURIComponent(sampleQuestion.question_uid)}`));
  await expect(page.getByText(/^Solve$/).first()).toBeVisible();
  await expectNoA11yViolations(page, "Solve");
});
