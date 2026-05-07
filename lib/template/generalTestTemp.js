const defaultReqTestTemp = (reqId, reqInfo) => {
  let testList = "";
  Object.entries(reqInfo.children).forEach(([tcId, tcInfo]) => {
    testList += `{
    testId: "${tcId}",
    annotations: {
      inputConditions: "${tcInfo?.input_conditions}",
      expectedResults: "${tcInfo?.expected_results}",
    },
    testStep: [stepName],
},`;
  });

  return `
import { test, expect } from "../../Lib/index.js";      


// 公共参数
const commonParams = {};

// 需求描述
const requireAnnotations = {
    requireDesc: "${reqInfo.req_desc}",
    step:  \`${reqInfo.test_step}\`,
};

const stepName = async ({ page, testInfo, ...options }) => {
  await test.step("xxx", async (stepInfo) => {
    let stepStatus = true

    // 阶段操作

    // 校验状态
    try {

    } catch (error) {
      stepStatus = false
    }

    await page.handle.addStepAnnotations({
      operate:'xxx',
      expected:'xxx',
      status:stepStatus
    })
  });
};

const testList =[${testList}]

// 调用需求方法
test.handleDescribeOperate({
  requireId: "${reqId}",
  requireAnnotations,
  testList,
  commonParams,
});
                  `;
};

const defaultTestTemp = (testId) => {
  return `
import { test, expect } from "../../Lib/index.js";  

const stepName = async ({ page, testInfo, ...options }) => {
  await test.step("xxx", async (stepInfo) => {
    let stepStatus = true

    // 阶段操作

    // 校验状态
    try {

    } catch (error) {
      stepStatus = false
    }

    await page.handle.addStepAnnotations({
      operate:'xxx',
      expected:'xxx',
      status:stepStatus
    })
  });
};

test.handleTestOperate({
  testId: "${testId}",
  annotations: {
    inputConditions: "",
    expectedResults: "",
  },
  params: {
    testStatus: false,
    testValue: 0,
  },
  testStep: [stepName],
});
                  `;
};

export const generalReqTestTemp = async (reqId, reqInfo) => {
  try {
    const customTemp = await import("../../hooks/reqTestTemp.js");
    return customTemp.testTemp(reqId, reqInfo);
  } catch (error) {
    return defaultReqTestTemp(reqId, reqInfo);
  }
};

export const generalTestTemp = async (testId) => {
  try {
    const customTemp = await import("../../hooks/testTemp.js");
    return customTemp.testTemp(testId);
  } catch (error) {
    return defaultTestTemp(testId);
  }
};
