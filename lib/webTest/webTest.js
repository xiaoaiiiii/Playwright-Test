import { test } from "@playwright/test";

import useCommonPlaywright from "../hooks/useCommonPlaywright.js";

import { projectPath } from "../../Configurations/config.js";

import { resetTestInfo } from "../script/resetTestEnv.js";

import { sleepTime } from "../utils/index.js";

export default test.extend({
  browser: async ({ playwright }, use, testInfo) => {
    const browser = await playwright.chromium.launch({ headless: false });
    console.log("browser 开始");
    await use(browser);
    console.log("browser 结束");
    await browser.close();
  },

  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      recordVideo: { dir: "TestReports/videos/" },
    });
    await use(context);
  },

  page: async ({ context }, use, testInfo) => {
    await sleepTime(500);
    const page = await context.newPage();
    page.on("domcontentloaded", () => page.handle.handleRequest());
    await use(page);
    // 保存登录信息
    // await page.context().storageState({ path: "config/storageState.json" });
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
