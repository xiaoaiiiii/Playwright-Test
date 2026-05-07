import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import {  join } from "node:path";

import playwright from "playwright";

import {
  getPage,
  sleepTime,
  generateRandom,
  isWebAddress,
  waitClientRun,
} from "../../utils/index.js";

import { projectPath } from "../../../Configurations/config.js";

const injectScript = async (page) => {
  await page.evaluate(() => {
    const script = document.createElement("script");
    script.src = "http://127.0.0.1:9527/assets/test-inject.js";
    document.body.appendChild(script);
    script.onload = () => window.testInjectHeader.render();
  });
};

const openWebView = async () => {
  const cdpPort = generateRandom(10000, 20000);
  const userDataDir = join(
    realpathSync.native(tmpdir()),
    `playwright-webview2-tests/user-data-dir-${cdpPort}`
  );
  await waitClientRun(cdpPort, userDataDir);
  await sleepTime(1000);

  const url = `http://127.0.0.1:${cdpPort}`;
  const browser = await playwright.chromium.connectOverCDP(url);
  const defaultContext = browser.contexts()[0];
  const page = await getPage(defaultContext.pages());
  page.on("domcontentloaded", async () => await injectScript(page));
  await injectScript(page);
};

const openWeb = async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(projectPath);
  page.on("domcontentloaded", async () => await injectScript(page));
  await injectScript(page);
};

const startApp = async () => {
  isWebAddress(projectPath) ? await openWeb() : await openWebView();
};
startApp();
