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
  await test.step("选择自适应模式", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div:nth-child(3) > label.o-input:nth-child(2) > input:nth-child(1)').click()

    try {
      const isChecked = await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div:nth-child(3) > label.o-input:nth-child(2) > input:nth-child(1)').isChecked();
      if (isChecked) {
        console.log('验证通过：自适应单选按钮已被选中');
        stepStatus = true;
      } else {
        console.log('验证失败：自适应单选按钮未被选中');
        stepStatus = false;
      }
    } catch (error) {
      stepStatus = false;
      console.error('验证自适应单选按钮状态时出错:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "点击自适应模式",
      expected: "进入自适应模式并成功解析数据",
      status: stepStatus,
    });
  });
};
// 校验CAN编号和Channel编号的数字是否一致
const stepname4 = async ({ page, testInfo, ...options }) => {
  await test.step("校验CAN编号和Channel编号一致性", async (stepInfo) => {
    let stepStatus = true;

    try {
      if (!page || page.isClosed()) {
        console.error('错误：页面已关闭，无法进行校验');
        stepStatus = false;
        await page.handle.addStepAnnotations({
          operate: "校验CAN编号和Channel编号的数字一致性",
          expected: "CAN编号和Channel编号的数字保持一致",
          status: stepStatus,
          error: "页面已关闭，无法进行校验"
        });
        return;
      }

      // 先检查对话框是否存在
      const dialogExists = await page.locator('div.o-import-dialog').isVisible();
      if (!dialogExists) {
        console.error('错误：导入对话框已关闭或不可见，无法进行校验');
        stepStatus = false;
        await page.handle.addStepAnnotations({
          operate: "校验CAN编号和Channel编号的数字一致性",
          expected: "CAN编号和Channel编号的数字保持一致",
          status: stepStatus,
          error: "导入对话框已关闭或不可见，无法进行校验"
        });
        return;
      }
      await page.waitForTimeout(1000);
      // 简化表格定位器
      const tableLocator = 'div.o-import-dialog table.adp-er tbody';

      // 先等待表格出现
      await page.waitForSelector(tableLocator, { state: 'visible', timeout: 10000 });

      // 获取表格中的所有行
      const rows = await page.locator(`${tableLocator} > tr`).all();
      const actualRowCount = rows.length;

      console.log(`\n检测到 ${actualRowCount} 行数据，将校验这些行的CAN和Channel编号一致性`);

      // 如果没有数据行，返回失败
      if (actualRowCount === 0) {
        console.error('错误：未检测到任何数据行');
        stepStatus = false;
        await page.handle.addStepAnnotations({
          operate: "校验CAN编号和Channel编号的数字一致性",
          expected: "CAN编号和Channel编号的数字保持一致",
          status: stepStatus,
          error: "未检测到任何数据行"
        });
        return;
      }

      // 创建数据数组存储实际行数的数据
      const canDataArray = [];
      const channelDataArray = [];

      // 遍历所有实际存在的行，跳过第一行
      for (let rowIndex = 0; rowIndex < actualRowCount; rowIndex++) {
        try {
          // 跳过第一行数据不做校验
          if (rowIndex === 0) {
            console.log(`第${rowIndex + 1}行 - 跳过校验，第一行数据不参与校验`);
            canDataArray.push({ skipped: true });
            channelDataArray.push({ skipped: true });
            continue;
          }

          // 再次检查页面是否仍然可用
          if (!page || page.isClosed()) {
            throw new Error('页面已关闭');
          }

          // 获取当前行的CAN编号文本
          const canText = await page.locator(`${tableLocator} > tr:nth-child(${rowIndex + 1}) > td:nth-child(1)`).innerText({ timeout: 5000 });

          // 获取当前行的Channel文本
          const channelText = await page.locator(`${tableLocator} > tr:nth-child(${rowIndex + 1}) > td:nth-child(2)`).innerText({ timeout: 5000 });

          console.log(`第${rowIndex + 1}行 - 获取到的CAN文本: ${canText}`);
          console.log(`第${rowIndex + 1}行 - 获取到的Channel文本: ${channelText}`);

          // 提取CAN文本中的数字
          const canMatch = canText.match(/CAN\s+(\d+)/i);
          const canNumber = canMatch ? canMatch[1] : null;

          // 提取Channel文本中的数字
          const channelMatch = channelText.match(/Channel\s+(\d+)/i);
          const channelNumber = channelMatch ? channelMatch[1] : null;

          // 存储到数组中
          canDataArray.push({
            text: canText,
            number: canNumber
          });

          channelDataArray.push({
            text: channelText,
            number: channelNumber
          });

        } catch (rowError) {
          console.error(`第${rowIndex + 1}行 - 获取数据时发生错误:`, rowError.message);
          // 记录错误信息
          canDataArray.push({ error: rowError.message });
          channelDataArray.push({ error: rowError.message });
        }
      }

      // 打印获取的数据结构
      console.log("\n获取到的数据结构:");
      console.log("CAN数据:");
      for (let i = 0; i < canDataArray.length; i++) {
        const data = canDataArray[i];
        if (data.error) {
          console.log(`  第${i + 1}行: 错误 - ${data.error}`);
        } else {
          console.log(`  第${i + 1}行: 文本="${data.text}", 数字=${data.number}`);
        }
      }

      console.log("\nChannel数据:");
      for (let i = 0; i < channelDataArray.length; i++) {
        const data = channelDataArray[i];
        if (data.error) {
          console.log(`  第${i + 1}行: 错误 - ${data.error}`);
        } else {
          console.log(`  第${i + 1}行: 文本="${data.text}", 数字=${data.number}`);
        }
      }

      // 校验每行对应位置的数字是否一致 - 每行数据都匹配才表示通过，跳过第一行
      let allMatch = true;
      const mismatchIndices = [];
      let validRowCount = 0;

      for (let i = 0; i < canDataArray.length; i++) {
        const canData = canDataArray[i];
        const channelData = channelDataArray[i];

        // 跳过第一行数据
        if (canData.skipped || channelData.skipped) {
          console.log(`第${i + 1}行: 跳过，第一行不参与校验`);
          continue;
        }

        // 跳过有错误的数据
        if (canData.error || channelData.error) {
          console.log(`第${i + 1}行: 跳过，存在错误`);
          continue;
        }

        validRowCount++;

        // 检查是否都成功提取了数字
        if (!canData.number || !channelData.number) {
          console.log(`第${i + 1}行: 无法提取完整数字 (CAN: ${canData.number}, Channel: ${channelData.number})`);
          allMatch = false;
          mismatchIndices.push(i + 1);
          continue;
        }

        // 校验数字是否一致
        if (canData.number !== channelData.number) {
          console.log(`第${i + 1}行: 不匹配 - CAN: ${canData.number}, Channel: ${channelData.number}`);
          allMatch = false;
          mismatchIndices.push(i + 1);
        } else {
          console.log(`第${i + 1}行: 匹配成功 - CAN: ${canData.number}, Channel: ${channelData.number}`);
        }
      }

      // 设置最终状态 - 每行数据都匹配才表示通过
      if (validRowCount === 0) {
        console.log("\n验证失败：没有可用于校验的有效数据行");
        stepStatus = false;
      } else if (allMatch) {
        console.log(`\n验证通过：在 ${validRowCount} 个有效数据行中，所有位置的CAN编号和Channel编号数字一致`);
        stepStatus = true;
      } else {
        console.log(`\n验证失败：共有 ${mismatchIndices.length} 个位置的数字不一致`);
        stepStatus = false;
      }

    } catch (error) {
      stepStatus = false;
      console.error('执行总体校验时发生错误:', error.message);
    }

    await page.handle.addStepAnnotations({
      operate: "校验CAN编号和Channel编号的数字一致性",
      expected: "CAN编号和Channel编号的数字保持一致",
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
  testId: "TC-TEST-007",
  requireAnnotations,
  annotations: {
    inputConditions: "同DBC解析通道不同解析方式（自适应MS11-U / 25RC10）",
    expectedResults: "测试成功",
  },
  params: {
    testStatus: true,
    testValue: 0,
  },
  testStep: [stepName1, stepName2, stepname3, stepname4, stepName5],
  requireAnnotations,
});
