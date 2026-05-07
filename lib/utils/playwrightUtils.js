/**
 * playwright的工具函数
 */

import { execa } from "execa";
import { sleepTime, checkPort } from "./index.js";
import { projectPath } from "../../Configurations/config.js";

// 获取当前测试的page
export const getPage = async (pages) => {
  await sleepTime(500);
  try {
    const page = pages.find(
      (page) => !page._mainFrame._url.includes("devtools://")
    );
    return page;
  } catch (error) {
    console.log("getPage error==>", error);
  }
};

// 等待程序启动
export function waitClientRun(port, userDataDir) {
  return new Promise(async (resolve, reject) => {
    const params = [
      "--debug",
      `--remote-debugging-port=${port}`,
      `--data-folder=${userDataDir}`,
    ];
    if (projectPath.includes(".py")) {
      execa("python", [projectPath, ...params], { shell: true });
    } else {
      execa(projectPath, params, { shell: true });
    }

    let count = 0;

    while (count < 100) {
      const isUse = await checkPort(port);
      if (isUse) {
        resolve(true);
        return false;
      }
      count++;
      await sleepTime(1000);
    }

    resolve(false);
  });
}
