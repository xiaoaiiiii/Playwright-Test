// 工具需求xlsx文件 转 json文件

import { writeFileSync, accessSync } from "node:fs";
import XLSX from "xlsx";

export const toolXlsxToJson = (excelPath) => {
  try {
    accessSync(excelPath);
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
          input_conditions,
          expected_results,
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
    return jsonPath;
  } catch (error) {
    console.log("toolXlsxToJson error=>", error);
    return false;
  }
};
