import { test, expect } from "../../lib/index.js";

// 需求描述
const requireAnnotations = {
  requireDesc: "需求名称",
  step: `
          需求步骤描述。
        `,
};



const stepName1 = async ({ page, testInfo, agent, ...options }) => {
  await test.step("步骤1名称", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作
    // await page.locator('section#container > article:nth-child(3) > section.el-container:nth-child(1) > div.personnelM:nth-child(2) > div.content-wrap:nth-child(2) > article:nth-child(2) > div.task_wrap:nth-child(1) > div.select_wrap:nth-child(1) > form.el-form:nth-child(1) > div.el-row:nth-child(2) > div.el-col:nth-child(1) > div.el-row:nth-child(1) > div.el-col:nth-child(5) > div.el-form-item:nth-child(1) > div.el-form-item__content:nth-child(2) > div.el-select:nth-child(1) > div.el-select__tags:nth-child(1) > input.el-select__input:nth-child(2)').click()
    await agent.ai("点击'作业编号'并输入‘123’");


    // 校验状态
    try {
      await agent.aiAssert("输入框中输入的值为‘123’");
      stepStatus = true;
    } catch (error) {
      stepStatus = false;
      console.error('[步骤1] 校验失败:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "操作1",
      expected: "预期1",
      status: stepStatus,
    });
  });
};

const stepName2 = async ({ page, testInfo, agent, ...options }) => {
  await test.step("步骤2名称", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作
    await agent.ai("点击'作业编号'并清空输入框");

    // 校验状态
    try {
      await agent.aiAssert("输入框为空");
      stepStatus = true;
    } catch (error) {
      stepStatus = false;
      console.error('[步骤2] 校验失败:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "操作2",
      expected: "预期2",
      status: stepStatus,
    });
  });
};

const stepName3 = async ({ page, testInfo, agent, ...options }) => {
  await test.step("步骤3名称", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作
    await agent.ai("点击进入'人员管理'页面并在QQ这一字段输入‘761087334’并点击搜索");
    // await agent.ai("点击进入'人员管理'页面");
    // await agent.ai("在QQ这一字段输入‘761087334’");
    // await agent.ai("点击搜索");
    // 校验状态
    try {
      await agent.aiAssert("输入框中输入的值为‘761087334’");
    } catch (error) {
      stepStatus = false;
      console.error('[步骤3] 校验失败:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "操作3",
      expected: "预期3",
      status: stepStatus,
    });
  });
};

const stepName4 = async ({ page, testInfo, agent, ...options }) => {
  await test.step("步骤4名称", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作
    await agent.ai("下滑页面，在表中勾选前五条数据");

    // 校验状态
    try {
      await agent.aiAssert("表中前五条数据被勾选");
    } catch (error) {
      stepStatus = false;
      console.error('[步骤4] 校验失败:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "操作4",
      expected: "预期4",
      status: stepStatus,
    });
  });
};

const stepName5 = async ({ page, testInfo, agent, ...options }) => {
  await test.step("步骤5名称", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作
    await agent.ai("点击'批量修改'按钮");
    await agent.ai("点击’取消‘按钮");
    await agent.ai("点击两次表头的一键勾选框，使其全未选中");
    // 校验状态
    try {
      await agent.aiAssert("表中数据均未被勾选");
    } catch (error) {
      stepStatus = false;
      console.error('[步骤5] 校验失败:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "操作5",
      expected: "预期5",
      status: stepStatus,
    });
  });
};

test.handleTestOperate({
  testId: "TC-TEST-001",
  requireAnnotations,
  annotations: {
    inputConditions: "用例输入条件",
    expectedResults: "用例预期结果",
  },
  params: {
    testStatus: true,
    testValue: 0,
  },
  testStep: [stepName1, stepName2,  stepName3, stepName4, stepName5],
  requireAnnotations,
});
