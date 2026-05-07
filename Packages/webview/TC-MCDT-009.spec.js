import { test, expect } from "../../lib/index.js";


// 需求描述
const requireAnnotations = {
  requireDesc: "查看报文 - 信号分析功能",
  step: `
          导入 BLF 文件后同版本dbc自适应解析结果(选择“MS11-U / 25RC10”模板）。
        `,
};
const stepName1 = async ({ page, testInfo, ...options }) => {
  await test.step("导入文件", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.home-page:nth-child(1) > div.home-tools:nth-child(2) > a.home-tools-box:nth-child(1) > i.home-icon:nth-child(1)').click()

    await page.evaluate(() => { pywebview.api.choosePath = () => Promise.resolve(JSON.stringify({ status: "ok", directory: "D:/test-data/sample/testfile_001.blf" })) }); await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-right:nth-child(2) > div.o-btn:nth-child(1)').click();

    // 校验状态
    try {
      expect(await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(2) > p.o-dialog-item-p:nth-child(2) > span.v-popper--has-tooltip:nth-child(1)')).toHaveText('testfile_001.blf')

      stepStatus = true;
    } catch (error) {
      stepStatus = false;
      console.error('文件名校验失败:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "点击导入按钮并上传文件",
      expected: "文件上传成功并显示正确的文件名",
      status: stepStatus,
    });
  });
};

const stepName2 = async ({ page, testInfo, ...options }) => {
  await test.step("选择dbc模板", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > div.vs__dropdown-toggle:nth-child(1) > div.vs__selected-options:nth-child(1) > span.vs__selected:nth-child(1)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > ul.vs__dropdown-menu:nth-child(2) > li.vs__dropdown-option:nth-child(1) > div.opt-er:nth-child(1) > div.opt-col:nth-child(1) > div.opt-row:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > ul.vs__dropdown-menu:nth-child(2) > li.vs__dropdown-option:nth-child(1) > div.opt-er:nth-child(1) > div.opt-col:nth-child(2) > div.opt-row:nth-child(2)').click()

    // 校验状态
    try {

      expect(await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > div.vs__dropdown-toggle:nth-child(1) > div.vs__selected-options:nth-child(1) > span.vs__selected:nth-child(1)')).toHaveText('MS11-U / 25RC10')

    } catch (error) {
      stepStatus = false;
    }

    await page.handle.addStepAnnotations({
      operate: "选择dbc模板",
      expected: "选择模板为MS11-U / 25RC10",
      status: stepStatus,
    });
  });
};

const stepname3 = async ({ page, testInfo, ...options }) => {
  await test.step("选择无自适应模式", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div:nth-child(3) > label.o-input:nth-child(1) > input:nth-child(1)').click()


    try {
      const isChecked = await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div:nth-child(3) > label.o-input:nth-child(1) > input:nth-child(1)').isChecked();
      if (isChecked) {
        console.log('验证通过：无自适应单选按钮已被选中');
        stepStatus = true;
      } else {
        console.log('验证失败：无自适应单选按钮未被选中');
        stepStatus = false;
      }
    } catch (error) {
      stepStatus = false;
      console.error('验证无自适应单选按钮状态时出错:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "点击无自适应模式",
      expected: "进入无自适应模式并成功解析数据",
      status: stepStatus,
    });
  });
};


const stepName5 = async ({ page, testInfo, ...options }) => {
  await test.step("回到桌面", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-footer-wrap:nth-child(3) > div.o-dialog-footer:nth-child(1) > div.o-btn:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-left:nth-child(1) > i.back-icon:nth-child(1)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.o-modal-er:nth-child(4) > div.o-modal-content:nth-child(1) > div.o-modal-btn:nth-child(3)').click()


    await page.handle.addStepAnnotations({
      operate: "回到桌面",
      expected: "回到桌面",
      status: stepStatus,
    });
  });
};

test.handleTestOperate({
  testId: "TC-TEST-009",
  requireAnnotations,
  annotations: {
    inputConditions: "同DBC解析通道不同解析方式（无自适应MS11-U / 25RC10）",
    expectedResults: "测试成功",
  },
  params: {
    testStatus: true,
    testValue: 0,
  },
  testStep: [stepName1, stepName2, stepname3, stepName5],
  requireAnnotations,
});
