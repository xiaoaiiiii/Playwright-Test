import { join } from "node:path";

import { generalReqTestTemp } from "../template/generalTestTemp.js";

import { randomStr, ensureFileExists } from "../utils/index.js";

const defaultAddData = () => {
  const reqId = `REQ-test-${randomStr(8)}`;
  const testId = `TC-test-${randomStr(8)}`;
  return {
    req_id: reqId,
    page: "",
    req_desc: "需求描述",
    priority: "高",
    test_step: "测试步骤",
    children: {
      [testId]: {
        req_id: reqId,
        tc_id: testId,
        input_conditions: "输入条件",
        expected_results: "预期结果",
      },
    },
  };
};

const generatReqTest = async () => {
  const reqInfo = defaultAddData();
  // 需求json
  const dirPath = process.argv.slice(2)[0];
  const configOutPath = join(dirPath, `${reqInfo.req_id}.spec.js`);
  const str = await generalReqTestTemp(reqInfo.req_id, reqInfo);
  ensureFileExists(configOutPath, str);
};
generatReqTest();
