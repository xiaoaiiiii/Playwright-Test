import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import config from "../../Configurations/config.js";

import { readJsonFile, ensureFileExists } from "../utils/index.js";

import { toolXlsxToJson } from "./toolXlsxToJson.js";
import { generalTestTemp } from "../template/generalTestTemp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultAddData = {
  [config.Tool]: {
    "REQ-test-1.0.0-001": {
      req_id: "REQ-test-1.0.0-001",
      page: "",
      req_desc: "需求描述",
      priority: "高",
      test_step: "测试步骤",
      children: {
        "TC-test-1.0.0-101": {
          req_id: "REQ-test-1.0.0-001",
          tc_id: "TC-test-1.0.0-101",
          input_conditions: "输入条件",
          expected_results: "预期结果",
        },
      },
    },
  },
};
const generalReqToTest = async () => {
  // 需求json
  const args = process.argv.slice(2)[0];
  const excelPath =
    args || join(__dirname, `../../Requirement/${config.Tool}.xlsx`);
  const jsonPath = toolXlsxToJson(excelPath);
  let reqData = readJsonFile(jsonPath) || defaultAddData;

  for (const [tool, toolInfo] of Object.entries(reqData)) {
    for (const [reqId, reqInfo] of Object.entries(toolInfo)) {
      const str = await generalTestTemp(reqId, reqInfo);

      const configOutPath = join(
        __dirname,
        `../../Packages/${tool}/${reqId}.spec.js`
      );
      ensureFileExists(configOutPath, str);
    }
  }
};
generalReqToTest();
