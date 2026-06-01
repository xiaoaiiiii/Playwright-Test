// @ts-check
import { defineConfig, devices } from "@playwright/test";
import { restoreStorageStateFromEnv } from "./lib/utils/auth.js";

// CI 场景：从环境变量还原 storageState（本地有文件则跳过）
restoreStorageStateFromEnv();

export default defineConfig({
  testDir: "./Packages",
  timeout: 120000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  workers: 1,
  reporter: [
    ["json", { outputFile: "./TestReports/test-results.json" }],
    ["html", { open: "never", outputFolder: "./TestReports/detail" }],
    ["./lib/script/customReport.js"],
  ],
  use: {
    trace: "off",
  },
  projects: [
    // 网页模式：projectPath 为 http(s) URL 时使用
    // 浏览器由 lib/webTest/webTest.js 内部 chromium.launch({ headless: false }) 启动
    {
      name: "web",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 1020 },
      },
    },
    // WebView2 / 桌面 exe 模式：projectPath 为本地可执行文件时启用
    // 由 lib/webViewTest/webViewTest.js 通过 CDP 连接自启程序
    // {
    //   name: "webview2",
    //   use: {
    //     browserName: "chromium",
    //     connectOptions: {
    //       wsEndpoint: "ws://127.0.0.1:9876/devtools/browser",
    //     },
    //     viewport: { width: 1280, height: 1020 },
    //   },
    // },
  ],
});
