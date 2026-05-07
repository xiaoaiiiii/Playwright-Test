// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 240000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  workers: 4,
  reporter: [
    ["json", { outputFile: "./TestReports/test-results.json" }],
    ["html", { open: "never", outputFolder: "./TestReports/detail" }],
    ["./Lib/script/customReport.js"],
  ],
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "webview2",
      use: {
        browserName: "chromium",
        connectOptions: {
          wsEndpoint: "ws://127.0.0.1:9876/devtools/browser",
        },
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "test",
      grep: "testIds",
    },
  ],
});
