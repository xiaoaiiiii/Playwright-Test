import { test } from "@playwright/test";

import useCommonPlaywright from "../hooks/useCommonPlaywright.js";

import { projectPath } from "../../Configurations/config.js";

import { resetTestInfo } from "../script/resetTestEnv.js";

import { sleepTime, getStorageStateOption } from "../utils/index.js";

export default test.extend({
  browser: async ({ playwright }, use, testInfo) => {
    // 本地有头方便观察，CI 无头（process.env.CI 由流水线注入）
    const browser = await playwright.chromium.launch({
      headless: !!process.env.CI,
    });
    console.log("browser 开始");
    await use(browser);
    console.log("browser 结束");
    await browser.close();
  },

  context: async ({ browser }, use) => {
    // 自动加载已保存的登录态，跳过 OA 登录（仅消费、不写回）
    const context = await browser.newContext({
      recordVideo: { dir: "TestReports/videos/" },
      ...getStorageStateOption(),
    });
    await use(context);
  },

  page: async ({ context }, use, testInfo) => {
    await sleepTime(500);
    const page = await context.newPage();
    page.on("domcontentloaded", () => page.handle.handleRequest());
    await use(page);
  },

  forEachTest: [
    async ({ page }, use, testInfo) => {
      if (testInfo.retry) {
        console.log("重试==>", testInfo.retry);
        resetTestInfo(testInfo);
      }

      page.handle = useCommonPlaywright(page, testInfo);
      await page.goto(projectPath);
      await page.waitForLoadState();

      await use();

      // 录制视频
      page.handle.handleWebVideo();
    },
    { auto: true },
  ],
});
