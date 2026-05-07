// 生成 -T config文件

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync, readFileSync, accessSync } from "node:fs";
import { execSync } from "child_process";
import XLSX from "xlsx";

import config from "../../Configurations/config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { traverseSuites } from "./generalReport.js";
import { readJsonFile } from "../utils/index.js";


// 工具需求xlsx文件 转 json文件
export const toolXlsxToJson = () => {
  const excelPath = join(__dirname, `../Requirement/${config.Tool}.xlsx`);
  const workbook = XLSX.readFile(excelPath, { type: "array" });
  const res = {};
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const header = [
      "req_id",
      "page",
      "req_desc",
      "priority",
      "tc_id",
      // "test_type",
      "test_step",
      "input_conditions",
      "expected_results",
      "test_status",
      "remark",
      "tc_req",
    ];
    const result = XLSX.utils.sheet_to_json(worksheet, { header });
    const list = {};
    result.slice(1).forEach((item) => {
      const {
        req_id,
        page,
        req_desc,
        priority,
        test_step,
        tc_id,
        input_conditions,
        expected_results,
        test_status,
        remark,
        tc_req,
      } = item;
      if (!tc_req) {
        const obj = {
          req_id,
          page,
          req_desc,
          priority,
          test_step,
          children: {},
        };
        list[req_id] = obj;
      } else {
        list[tc_req].children[req_id] = {
          req_id,
          tc_id: req_id,
          input_conditions,
          expected_results,
        };
      }
    });
    res[sheetName] = list;
  });

  const jsonString = JSON.stringify(res, null, 2);
  const jsonPath = excelPath.split(".")[0] + ".json";
  writeFileSync(jsonPath, jsonString, "utf8");
};

// 获取所有的测试用例
const getAllTestCaseList = () => {
  try {
    //, { stdio: "inherit", shell: true }
    execSync("npx playwright test --list");
    return true;
  } catch (error) {
    console.error("执行失败:", error.message);
    return false;
  }
};

const priorityMap = {
  高: 0,
  中: 1,
  低: 2,
};

const generatTConfig = () => {
  // 案例json
  const caseStatus = getAllTestCaseList();
  if (!caseStatus) return false;
  const caseData = readJsonFile(join(__dirname, "../../TestReports/test-case.json"));

  // 需求json
  toolXlsxToJson();
  const reqData = readJsonFile(
    join(__dirname, `../Requirement/${config.Tool}.json`)
  );

  const configResultJson = readJsonFile(
    join(__dirname, "../../backup/test-results.json")
  );
  const testStepMap = {};
  if (configResultJson) {
    const data = [];
    traverseSuites(configResultJson.suites, data);
    data.forEach((item) => {
      item.children.forEach((it) => {
        testStepMap[it.title] = it.testSetps.map((step, index) => {
          return {
            step: index + 1,
            operate: step.operate,
            expected: step.expected,
          };
        });
      });
    });
  }

  const obj = {
    ...config,

    Req_list: {},
    Test_cases: {},
  };
  Object.entries(caseData).forEach(([tool, value]) => {
    const toolReq = reqData[tool];
    value.forEach((item) => {
      const { title: req_id, children } = item;
      const toolReqInfo = toolReq[req_id];
      obj.Req_list[req_id] = toolReqInfo.req_desc;
      obj.Test_cases[req_id] = {};

      children.forEach((it) => {
        const { title: tc_id } = it;
        const toolTcInfo = toolReqInfo.children[tc_id];
        obj.Test_cases[req_id][tc_id] = {
          description: toolTcInfo?.input_conditions,
          priority: priorityMap[toolReqInfo?.priority || "高"],
          detail: testStepMap[tc_id] || [],
        };
      });
    });
  });

  try {
    const configOutPath = join(__dirname, "../../TestSet_description.json");
    writeFileSync(configOutPath, JSON.stringify(obj), { encoding: "utf-8" });
    console.log("生成执行配置成功:", configOutPath);
  } catch (error) {
    console.error("生成执行配置失败:", error);
  }
};
generatTConfig();
