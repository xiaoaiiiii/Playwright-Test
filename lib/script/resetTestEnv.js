// 重置测试环境
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { rmFolder } from "../utils/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const reportPath = join(__dirname, `../../TestReports`);

export default () => {
  const userDataDir = join(
    realpathSync.native(tmpdir()),
    `playwright-webview2-tests`
  );
  rmFolder(userDataDir);
  const htmlDirPath = join(reportPath, `./index.html`);
  rmFolder(htmlDirPath);
  const imagesDirPath = join(reportPath, `./images`);
  rmFolder(imagesDirPath);
  const videoDirPath = join(reportPath, `./videos`);
  rmFolder(videoDirPath);
  const fixturesDirPath = join(__dirname, `../../fixtures`);
  rmFolder(fixturesDirPath);
};

export const resetTestInfo = (testInfo) => {
  const imagesDirPath = join(reportPath, `./images/${testInfo.title}`);
  rmFolder(imagesDirPath);
};
