// 执行测试文件 -C

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 生成playwright配置工具
const generateConfigFile = () => {
  const selectJSONPath = join(__dirname, "../../TestIds.json");
  const selectJSON = readFileSync(selectJSONPath, { encoding: "utf-8" });
  const selectTest = JSON.parse(selectJSON);

  const playwrightConfig = join(__dirname, "../template/playwright.config.ts");
  const config = readFileSync(playwrightConfig, { encoding: "utf-8" });

  const configOutPath = join(__dirname, "../../playwright.config.ts");
  const runTest = new RegExp(selectTest.testIds.join("|"));
  const modifiedConfig = config.replace(/\"testIds\"/i, runTest);
  try {
    writeFileSync(configOutPath, modifiedConfig, { encoding: "utf-8" });
    console.log("生成执行配置成功:", configOutPath);
  } catch (error) {
    console.error("生成执行配置失败:", error);
  }
};
//

// 执行功能
export const run = () => {
  try {
    generateConfigFile();
    execSync('npx playwright test --project="test"', { stdio: "inherit" });
  } catch (error) {
    console.error("执行失败:", error.message);
  }
};
run();
