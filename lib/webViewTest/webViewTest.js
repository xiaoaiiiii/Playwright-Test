import { test } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";

import {
  getPage,
  sleepTime,
  generateRandom,
  waitClientRun,
} from "../utils/index.js";

import { resetTestInfo } from "../script/resetTestEnv.js";

import useCommonPlaywright from "../hooks/useCommonPlaywright.js";

const devPort = 9876;
let page;
let pid = null;
export default test.extend({
  browser: async ({ playwright }, use, testInfo) => {
    // const isDev = await checkPort(devPort);
    // console.log("isDev==>", isDev);

    // const cdpPort = isDev ? devPort : generateRandom(10000, 20000);
    const cdpPort = generateRandom(10000, 20000);
    const userDataDir = path.join(
      fs.realpathSync.native(os.tmpdir()),
      `playwright-webview2-tests/user-data-dir-${cdpPort}`
    );

    // 等待程序启动
    await waitClientRun(cdpPort, userDataDir);

    await sleepTime(2000);
    console.log("browser 开始", cdpPort);
    const url = `http://127.0.0.1:${cdpPort}`;
    const browser = await playwright.chromium.connectOverCDP(url);
    await use(browser);

    await browser.close();
    console.log("browser 结束", cdpPort);
  },

  context: async ({ browser }, use, testInfo) => {
    console.log("context 开始", testInfo.title);
    const context = browser.contexts()[0];
    await use(context);
    console.log("context 关闭");
  },

  page: async ({ context }, use, testInfo) => {
    page = await getPage(context.pages());
    console.log("page 开始", testInfo.title);
    page.on("domcontentloaded", () => page.handle.handleRequest());
    await use(page);

    console.log("page 结束", testInfo.title);
  },

  forEachTest: [
    async ({ page, context }, use, testInfo) => {
      // 重试
      if (testInfo.retry) {
        console.log("重试==>", testInfo.retry);
        resetTestInfo(testInfo);
      }

      page.handle = useCommonPlaywright(page, testInfo);

      // 刷新
      await page.reload();
      await page.waitForLoadState();

      // const min = 100 + 500 * testInfo.workerIndex;
      // await sleepTime(generateRandom(min, min + 2000));

      // 设置窗口尺寸
      await page.evaluate(async () => window.pywebview.api.resize(1920, 1580));
      console.log("forEach 开始", testInfo.title);

      // 录制视频
      const stopVideo = page.handle.handleWebViewVideo(context);
      await use();
      await stopVideo();
      try {
        page.evaluate(async () => {
          setTimeout(() => window.pywebview.api.destroy(), 8000);
        });
      } catch (error) {
        console.log("destroy error==>", error);
      }
      console.log("forEach 结束", testInfo.title);
    },
    { auto: true },
  ],
});
