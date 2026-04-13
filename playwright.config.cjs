const { defineConfig, devices } = require("@playwright/test");

const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}/Gate_QA`;

module.exports = defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: process.env.CI ? 2 : 2,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1365, height: 900 },
      },
    },
  ],
  webServer: {
    command: `npm run serve -- --host ${HOST} --port ${PORT}`,
    url: `${BASE_URL}/`,
    // Keep E2E deterministic in local/CI runs; stale preview servers can hide fresh fixes.
    reuseExistingServer: false,
    timeout: 120000,
  },
});
