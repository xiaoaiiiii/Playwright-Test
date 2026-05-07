import { fileURLToPath } from "node:url";
import { dirname, basename } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

import resetTestEnv from "./resetTestEnv.js";
import generalReport from "./generalReport.js";

export default class MyReporter {
  constructor(options) {}

  printsToStdio() {
    return false;
  }

  onError(err) {
    console.log("error==>", err);
  }

  async onBegin() {
    try {
      console.log("开始测试==>", __dirname);
      resetTestEnv();
    } catch (error) {
      console.log("开始测试error==>", error);
    }
  }

  onEnd(result) {
    console.log("测试结束，状态", result.status);
    generalReport();
  }
}
