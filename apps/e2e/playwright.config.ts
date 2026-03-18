import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3030";

export default defineConfig({
  testDir: "./src/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    process.env.CI ? ["github"] : ["list"],
  ],

  globalSetup: "./src/global.setup.ts",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "on",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile viewports
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  // Local dev server
  // NOTE: For faster iteration, start the dev server manually (`bun run dev` from root)
  // Tests will use the existing server. Set NO_SERVER=1 to skip webServer entirely.
  webServer:
    process.env.CI || process.env.NO_SERVER
      ? undefined
      : {
          command: "bun run dev",
          cwd: "../..",
          url: BASE_URL,
          reuseExistingServer: true,
          timeout: 180 * 1000, // 3 minutes for initial build
          stdout: "pipe",
          stderr: "pipe",
        },
});
