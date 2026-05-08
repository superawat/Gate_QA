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

async function collectAccessibilityStructure(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };

    const textFor = (element) => {
      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        return labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent || "")
          .join(" ");
      }
      return (
        element.getAttribute("aria-label") ||
        element.getAttribute("placeholder") ||
        element.textContent ||
        ""
      );
    };

    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();

    const landmarks = Array.from(document.querySelectorAll("header, main, nav, aside, footer"))
      .filter(isVisible)
      .map((element) => element.tagName.toLowerCase());

    const headings = Array.from(document.querySelectorAll("h1, h2, h3, [role='heading']"))
      .filter(isVisible)
      .slice(0, 12)
      .map((element) => normalize(textFor(element)))
      .filter(Boolean);

    const controls = Array.from(document.querySelectorAll("a[href], button, input, select, textarea, [role='button'], [role='link']"))
      .filter(isVisible)
      .map((element) => normalize(textFor(element)))
      .filter(Boolean)
      .slice(0, 80);

    return { landmarks, headings, controls };
  });
}

async function expectAccessibilityStructure(page, routeLabel, expected) {
  const snapshot = await collectAccessibilityStructure(page);

  for (const landmark of expected.landmarks || []) {
    expect(snapshot.landmarks, `${routeLabel} landmark snapshot`).toContain(landmark);
  }

  for (const heading of expected.headings || []) {
    expect(snapshot.headings, `${routeLabel} heading snapshot`).toContain(heading);
  }

  for (const controlPattern of expected.controls || []) {
    expect(
      snapshot.controls.some((control) => controlPattern.test(control)),
      `${routeLabel} control snapshot is missing ${controlPattern}: ${snapshot.controls.join(" | ")}`
    ).toBe(true);
  }
}

test("axe audit: landing route", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("link", { name: /GATE QA home/i })).toBeVisible();
  await expectAccessibilityStructure(page, "Landing", {
    landmarks: ["header", "main", "footer"],
    headings: ["GateQA practice dashboard"],
    controls: [/GATE QA home/i, /Random Practice/i, /Filter Questions/i],
  });
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
  await expectAccessibilityStructure(page, "Explore", {
    landmarks: ["header", "main", "aside", "footer"],
    headings: ["Explore questions", "Choose a question directly"],
    controls: [/Search keywords/i, /Open/i],
  });
  await expectNoA11yViolations(page, "Explore");
});

test("axe audit: solve route", async ({ page }) => {
  const sampleQuestion = getSampleQuestion();
  await page.goto(appPath(`/practice/question/${encodeURIComponent(sampleQuestion.question_uid)}`));
  await expect(page.getByText(/^Solve$/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: sampleQuestion.title })).toBeVisible({ timeout: 15000 });
  await expectAccessibilityStructure(page, "Solve", {
    landmarks: ["header", "main", "footer"],
    headings: [sampleQuestion.title],
    controls: [/Back to Results/i, /Open calculator/i, /Submit Answer/i],
  });
  await expectNoA11yViolations(page, "Solve");
});
