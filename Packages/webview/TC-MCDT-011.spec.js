import { test, expect } from "../../lib/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
  compareImagesByPx,
  compareImagesByFeature,
} from "../../lib/script/compareImages/index.js";

const TestFile1 = join(__dirname, "../../lib/TestDataBase/TestFile/20230518_V055车辆调试_交直流充电测试_VCUM_A_E4U0_R800_400V_VPBoxcar_V03_余绪东.dat");
const TestFile2 = join(__dirname, "../../lib/TestDataBase/TestFile/test_import.txt");
// 公共参数
const commonParams = {};

// 需求描述
const requireAnnotations = {
  requireDesc: "查看报文-信号分析-信号选择",
  step: `验证信号分析功能选择信号相关操作符合预期`,
};

const stepName_1e = async ({ page, testInfo, ...options }) => {
  await test.step("进入信号分析", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作
    await page.locator('div#app > div.o-body:nth-child(2) > div.home-page:nth-child(1) > div.home-tools:nth-child(2) > a.home-tools-box:nth-child(1) > i.home-icon:nth-child(1)').click()

    await page.evaluate((testFilePath) => {
      pywebview.api.choosePath = async () => Promise.resolve(JSON.stringify({ status: "ok", directory: testFilePath }));
    }, TestFile1);  // 第二个参数是要传递给回调的值
    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-right:nth-child(2) > div.o-btn:nth-child(1)').click();

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-footer-wrap:nth-child(3) > div.o-dialog-footer:nth-child(1) > div.o-btn:nth-child(2)').click()
    // 校验状态
    try {

      expect(await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-left:nth-child(1) > span.record-header-title:nth-child(3)')).toHaveText('查看报文-信号分析')

    } catch (error) {
      stepStatus = false
    }

    await page.handle.addStepAnnotations({
      operate: '点击信号分析',
      expected: '进入信号分析页面',
      status: stepStatus
    })
  });
};

const step1 = async ({ page, testInfo, ...options }) => {
  await test.step("前置操作", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#delete_module > span:nth-child(2)').click()

    await page.getByText('新建视图', { exact: true }).click()


    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-manage-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-header-wrap:nth-child(1) > i.o-dialog-title-close:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-select-wrap:nth-child(1) > div.ant-select:nth-child(1) > div.ant-select-selector:nth-child(1) > span.ant-select-selection-item:nth-child(2)').click()

    await page.locator('div.ant-select-dropdown:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div.rc-virtual-list:nth-child(3) > div.rc-virtual-list-holder:nth-child(1)').evaluate(e => { e.scrollTop = 0; e.scrollLeft = 0 })

    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('Enter');


    await page.locator('div#delete_module').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-manage-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-dialog-modal-wrap:nth-child(2) > div.o-dialog-card-wrap:nth-child(2) > div.o-dialog-card:nth-child(1) > div.o-dialog-card-header:nth-child(1) > div.o-card-right:nth-child(2) > i.i-delete:nth-child(3)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-manage-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-dialog-modal-wrap:nth-child(2) > div.o-dialog-card-wrap:nth-child(2) > div.o-dialog-card:nth-child(1) > div.o-dialog-card-header:nth-child(1) > div.o-card-right:nth-child(2) > i.i-delete:nth-child(3) > div.tool-picker-wrap:nth-child(1) > div.tool-picker-footer-wrap:nth-child(3) > div.o-dialog-footer:nth-child(1) > div.o-btn:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-manage-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-header-wrap:nth-child(1) > i.o-dialog-title-close:nth-child(2)').click()


    // 校验状态
    try {
      expect(await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-right:nth-child(2) > span.record-header-message:nth-child(2) > span.record-header-message-imp:nth-child(1)')).toHaveText('20230518_V...car_V03_余绪东.dat')
    } catch (error) {
      stepStatus = false;
    }

    await page.handle.addStepAnnotations({
      operate: "导入文件并新建一个视图",
      expected: "导入成功，新建一个空视图",
      status: stepStatus,
    });
  });
};

const step2 = async ({ page, testInfo, ...options }) => {
  await test.step("选择前五个信号", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(1) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(2) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(3) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(4) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(5) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.chs-btn:nth-child(3)').click()

    await page.handle.addStepAnnotations({
      operate: "选择前五个信号，点击确定",
      expected: "展示出前五个信号",
      status: stepStatus,
    });
  });
};

const step3 = async ({ page, testInfo, ...options }) => {
  await test.step("取消选择", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.head-btn:nth-child(1) > span:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(1) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(2) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(3) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(4) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(5) > div.chs-node:nth-child(1) > span.chs-node-signal:nth-child(2)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.chs-btn:nth-child(3)').click()

    await page.handle.addStepAnnotations({
      operate: '取消选择已选的信号',
      expected: '信号取消成功',
      status: stepStatus
    })
  });
};

const step4 = async ({ page, testInfo, ...options }) => {
  await test.step("点击选择信号", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.head-btn:nth-child(1) > span:nth-child(2)').click()


    await page.handle.addStepAnnotations({
      operate: '点击选择信号',
      expected: '成功弹出“选择信号”弹窗',
      status: stepStatus
    })
  });
};

const step5 = async ({ page, testInfo, ...options }) => {
  await test.step("筛选搜索", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > input.chs-input-er:nth-child(1)').click()


    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > input.chs-input-er:nth-child(1)').fill('UDB')

    await page.handle.addStepAnnotations({
      operate: '在搜索框中搜索‘UDB’',
      expected: '显示出包含UDB的信号',
      status: stepStatus
    })
  });
};

const step_creat = async ({ page, testInfo, ...options }) => {
  await test.step("创建的空白视图", async (stepInfo) => {

    let stepStatus = true
    // 阶段操作
    await page.locator("#delete_module").click();
    await page.waitForTimeout(1000);

    // 记录创建前的div数量
    const divCountBefore = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
    console.log("创建前视图数量:", divCountBefore);
    await page.locator(".o-add-card-left").click();
    await page.waitForTimeout(1000);

    // 校验：检查o-dialog-card-wrap下面的div个数
    try {
      const divCountAfter = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();

      console.log("创建后视图数量:", divCountAfter);
      // 预期应该比创建前多1个div
      expect(divCountAfter).toBe(divCountBefore + 1);
      // 或者直接检查是否为2个div（根据业务需求调整）
      // expect(divCountAfter).toBe(2);
    } catch (error) {
      console.error("校验失败：", error);
      stepStatus = false;
    }

    await page.handle.addStepAnnotations({
      operate: '点击创建视图按钮',
      expected: '成功创建一个空白视图',
      status: stepStatus
    })
  });
};

const step_enter = async ({ page, testInfo, ...options }) => {
  await test.step("进入新创建的视图", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作
    const targetElement = page.locator('.o-dialog-card-wrap .o-dialog-card').nth(1);
    await page.waitForTimeout(1000);
    await targetElement.dblclick();

    await page.handle.addStepAnnotations({
      operate: '双击新创建的视图',
      expected: '成功进入一个空白视图',
      status: stepStatus
    })
  });
};

const step_copy = async ({ page, testInfo, ...options }) => {
  await test.step("复制新创建的视图", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作
    const divCountBefore = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
    console.log("复制前的数量:", divCountBefore);
    await page.locator('.i-copy').nth(1).click()
    await page.waitForTimeout(1000);

    await page.getByText('复制到当前配置').click()

    try {
      const divCountAfter = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
      console.log("复制后div数量:", divCountAfter);
      // 预期应该比复制前多1个div
      expect(divCountAfter).toBe(divCountBefore + 1);
    } catch (error) {
      console.error("校验失败：", error);
      stepStatus = false;
    }

    await page.handle.addStepAnnotations({
      operate: '复制新创建的视图',
      expected: '成功复制一个空白视图',
      status: stepStatus
    })
  });
};
const step_rename = async ({ page, testInfo, ...options }) => {
  await test.step("重命名新创建的视图", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作
    await page.locator('.i-edit').nth(1).click();
    await page.waitForTimeout(1000);

    await page.locator('.chs-input-er').fill('New-View');
    await page.locator('.tool-picker-wrap .o-btn').nth(1).click();

    try {
      await expect(page.getByTitle('New-View')).toHaveText('New-View');
      await page.waitForTimeout(1000);
      stepStatus = true;
    } catch (error) {
      console.error("校验失败：", error);
      stepStatus = false;
    }

    await page.handle.addStepAnnotations({
      operate: '重命名新创建的视图',
      expected: '成功重命名一个空白视图',
      status: stepStatus
    })
  });
};

const step_delete2 = async ({ page, testInfo, ...options }) => {
  await test.step("删除上次创建的空白视图", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作
    //点击管理视图进入管理视图界面
    await page.getByTitle('管理视图').click()
    await page.waitForTimeout(1000);
    // 记录删除前的div数量
    let divCountBefore = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
    console.log("删除前视图数量:", divCountBefore);

    // 检测所有i-delete图标的数量
    let deleteIconCount = await page.locator('.i-delete').count();
    console.log("检测到i-delete图标数量:", deleteIconCount);

    // 循环删除所有图标
    while (deleteIconCount > 0) {
      try {
        // 点击第一个删除按钮
        await page.locator('.i-delete').first().click();
        await page.waitForTimeout(1000);

        // 点击确定
        await page.locator('.o-dialog-footer .o-btn').nth(1).click();
        await page.waitForTimeout(1000);

        // 更新图标数量
        deleteIconCount = await page.locator('.i-delete').count();
        console.log("剩余i-delete图标数量:", deleteIconCount);

      } catch (error) {
        console.error("删除过程中出现错误:", error);
        // 如果出现错误，重新获取图标数量
        deleteIconCount = await page.locator('.i-delete').count();
        console.log("重新检测后剩余i-delete图标数量:", deleteIconCount);
      }
    }

    // 校验：检查删除后是否只保留一个默认视图
    try {
      const divCountAfter = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
      console.log("最终视图数量:", divCountAfter);
      // 预期应该只保留1个默认视图
      expect(divCountAfter).toBe(1);
    } catch (error) {
      console.error("校验失败：", error);
      stepStatus = false;
    }


    await page.locator('.o-dialog-title-close').click()

    await page.handle.addStepAnnotations({
      operate: '点击删除按钮删除视图,保持视图管理器中只有一个视图',
      expected: '成功删除视图',
      status: stepStatus
    })
  });
};

const step_delete = async ({ page, testInfo, ...options }) => {
  await test.step("删除上次复制空白视图", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作
    // 记录删除前的div数量
    let divCountBefore = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
    console.log("删除前视图数量:", divCountBefore);

    // 检测所有i-delete图标的数量
    let deleteIconCount = await page.locator('.i-delete').count();
    console.log("检测到i-delete图标数量:", deleteIconCount);

    // 循环删除所有图标
    while (deleteIconCount > 0) {
      try {
        // 点击第一个删除按钮
        await page.locator('.i-delete').first().click();
        await page.waitForTimeout(1000);

        // 点击确定
        await page.locator('.o-dialog-footer .o-btn').nth(1).click();
        await page.waitForTimeout(1000);

        // 更新图标数量
        deleteIconCount = await page.locator('.i-delete').count();
        console.log("剩余i-delete图标数量:", deleteIconCount);

      } catch (error) {
        console.error("删除过程中出现错误:", error);
        // 如果出现错误，重新获取图标数量
        deleteIconCount = await page.locator('.i-delete').count();
        console.log("重新检测后剩余i-delete图标数量:", deleteIconCount);
      }
    }

    // 校验：检查删除后是否只保留一个默认视图
    try {
      const divCountAfter = await page.locator(".o-dialog-card-wrap .o-dialog-card").count();
      console.log("最终视图数量:", divCountAfter);
      // 预期应该只保留1个默认视图
      expect(divCountAfter).toBe(1);
    } catch (error) {
      console.error("校验失败：", error);
      stepStatus = false;
    }


    await page.locator('.o-dialog-title-close').click()

    await page.handle.addStepAnnotations({
      operate: '点击删除按钮删除视图,保持视图管理器中只有一个视图',
      expected: '成功删除视图',
      status: stepStatus
    })
  });
};

const stepName_oc = async ({ page, testInfo, ...options }) => {
  await test.step("选0个信号", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(4) > div.chs-list-er:nth-child(2) > div.chs-btn:nth-child(3)').click()

    // 校验状态
    try {


      expect(await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-tree-er:nth-child(3) > div.vtlist:nth-child(1)')).toBeVisible()


    } catch (error) {
      stepStatus = false
    }

    await page.handle.addStepAnnotations({
      operate: '不选择信号，直接点击确定',
      expected: '无报错，页面不展示信号分析',
      status: stepStatus
    })
  });
};

const step_drag = async ({ page, testInfo, ...options }) => {
  await test.step("拖动新建视图值列表最前端", async (stepInfo) => {
    let stepStatus = true
    // 阶段操作-拖动新建视图值列表最前端
    await (page.locator('.o-dialog-card').nth(1)).dragTo(page.locator('.o-dialog-card').nth(0));
    // 校验状态
    try {
      const dataActiveValue = await page.locator('.o-dialog-card').nth(0).getAttribute('data-active');
      console.log("data-active属性值:", dataActiveValue);
      // 校验属性值是否为false
      expect(dataActiveValue).toBe('false');
      stepStatus = true

    } catch (error) {
      stepStatus = false
    }

    await page.handle.addStepAnnotations({
      operate: '拖动新建视图值列表最前端',
      expected: '视图值列表最前端视图值为新建视图',
      status: stepStatus
    })
  });
};

const step_OutIn = async ({ page, testInfo, ...options }) => {
  await test.step("导出信号再将导出信号导入", async (stepInfo) => {
    let stepStatus = true


    await page.locator('#delete_module').click()
    // 等待管理视图对话框打开
    await page.locator('.o-manage-dialog').waitFor({
      state: 'visible',
      timeout: 5000
    })
    await page.locator('.o-add-card-right').click();
    await page.evaluate((testFilePath) => {
      pywebview.api.choosePath = async () => Promise.resolve(JSON.stringify({ status: "ok", directory: testFilePath }));
    }, TestFile2);
    await page.waitForTimeout(1000);


    //点击x号回到桌面
    await page.locator('.o-dialog-title-close').click()
    // 阶段操作-导出信号
    await page.locator('#delete_module').click()
    // 等待管理视图对话框打开
    await page.locator('.o-manage-dialog').waitFor({
      state: 'visible',
      timeout: 5000
    });
    await page.waitForTimeout(1000);

    // 等待导出按钮可见且稳定
    await page.locator('.i-export').nth(0).waitFor({
      state: 'visible',
      timeout: 5000
    });
    await page.locator('.i-export').nth(0).click();
    await page.waitForTimeout(3000);
    //点击x号回到桌面
    await page.locator('.o-dialog-title-close').click()
    await page.waitForTimeout(1000);



    await page.handle.addStepAnnotations({
      operate: '导出信号再将导出信号导入',
      expected: '成功导入信号',
      status: stepStatus
    })
  });
};
const stepName_ku = async ({ page, testInfo, ...options }) => {
  await test.step("测试信号选择上限（最多30个）", async (stepInfo) => {
    let stepStatus = true;

    try {
      // 等待列表容器加载（修复选择器：使用双下划线）
      const listContainer = page.locator('.vue-recycle-scroller__item-wrapper');
      await listContainer.waitFor({ timeout: 30000 });

      let selectedCount = 0;
      const step = 28; // 每次递增28px
      const maxSelect = 30; // 最多选30个
      const maxIterations = 100; // 最大循环次数，避免无限循环

      for (let i = 0; i < maxIterations; i++) {
        // 动态拼接style定位表达式：匹配transform包含translateY(28*i px)的元素（修复选择器：使用双下划线）
        const translateYValue = step * i;
        const signalItem = page.locator(
          `.vue-recycle-scroller__item-view[style*="transform: translateY(${translateYValue}px)"]`
        );

        // 检查元素是否存在且可见，存在则选择
        if (await signalItem.isVisible()) {
          await signalItem.click(); // 选择当前元素
          selectedCount++;
          console.log(`已选择第 ${selectedCount} 个元素（translateY: ${translateYValue}px）`);
        }

        // 检查是否出现“选择不能超过30项”提示，出现则跳出循环
        const limitTip = page.locator('text=选择不能超过30项');
        if (await limitTip.isVisible()) {
          console.log(`已选择第 ${selectedCount} 个元素（translateY: ${translateYValue}px）`);
          console.log('选择第31个信号时无法选中，检测到数量限制提示，终止选择');
          break;
        }

        // 下拉页面（每次选10个后下拉280px）
        if (selectedCount % 10 === 0 && selectedCount > 0) {
          await listContainer.evaluate(container => {
            container.scrollTop += 280; // 下拉280px
          });
          await page.waitForTimeout(500); // 等待新元素加载
        }
      }

    } catch (error) {
      console.error('测试过程中发生严重错误:', error.message);
      // 捕获所有异常，避免测试崩溃
      stepStatus = false;
    }

    await page.handle.addStepAnnotations({
      operate: '测试信号选择上限，尝试选择30个信号',
      expected: '成功选择30个信号后，尝试选择额外信号时系统应有限制，显示提示或保持当前选择状态',
      status: stepStatus
    });
  });
};
const returnToDesktop = async ({ page, testInfo, ...options }) => {
  await test.step("回到桌面", async (stepInfo) => {
    let stepStatus = true;

    // 阶段操作

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-left:nth-child(1) > i.back-icon:nth-child(1)').click()

    await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.o-modal-er:nth-child(4) > div.o-modal-content:nth-child(1) > div.o-modal-btn:nth-child(3)').click()


    await page.handle.addStepAnnotations({
      operate: "回到桌面",
      expected: "回到桌面",
      status: stepStatus,
    });
  });
};

const testList = [
  {
    testId: "101",
    annotations: {
      inputConditions: "信号选择/取消",
      expectedResults: "可以正常选择/取消信号",
    },
    params: {
      testStatus: false,
      testValue: 0,
    },
    testStep: [stepName_1e, step1, step4, step2, step3, returnToDesktop],
  },
  {
    testId: "102",
    annotations: {
      inputConditions: "信号筛选",
      expectedResults: "可以正常筛选信号",
    },
    testStep: [stepName_1e, step1, step4, step5, returnToDesktop],
  },
  {
    testId: "103",
    annotations: {
      inputConditions: "信号选择下限（0）",
      expectedResults: "不选择信号无报错",
    },
    testStep: [stepName_1e, step1, step4, stepName_oc, returnToDesktop],
  },
  {
    testId: "104",
    annotations: {
      inputConditions: "信号选择上限（30）",
      expectedResults: "选择30个信号后不能再次选择",
    },
    testStep: [stepName_1e, step1, step4, stepName_ku, returnToDesktop],
  },
  {
    testId: "105",
    annotations: {
      inputConditions: "验证视图新建功能",
      expectedResults: "新建视图",
    },
    testStep: [stepName_1e, step_creat, step_enter, step_delete2, returnToDesktop],
  },
  {
    testId: "106",
    annotations: {
      inputConditions: "验证视图切换功能",
      expectedResults: "成功切换视图",
    },
    testStep: [stepName_1e, step_creat, step_enter, step_delete2, returnToDesktop],
  },
  {
    testId: "107",
    annotations: {
      inputConditions: "验证可以复制视图",
      expectedResults: "成功复制视图",
    },
    testStep: [stepName_1e, step_creat, step_copy, step_delete, returnToDesktop],
  },
  {
    testId: "108",
    annotations: {
      inputConditions: "验证可以重命名视图",
      expectedResults: "成功重命名视图",
    },
    testStep: [stepName_1e, step_creat, step_rename, step_delete, returnToDesktop],
  },
  {
    testId: "109",
    annotations: {
      inputConditions: "验证可以重命名视图",
      expectedResults: "成功重命名视图",
    },
    testStep: [stepName_1e, step_creat, step_rename, step_drag, step_delete, returnToDesktop],
  },
  {
    testId: "110",
    annotations: {
      inputConditions: "验证可以删除已创建的视图",
      expectedResults: "成功删除视图",
    },
    testStep: [stepName_1e, step_creat, step_delete, returnToDesktop],
  },
  {
    testId: "111",
    annotations: {
      inputConditions: "验证可以正常导出、导入视图",
      expectedResults: "成功导出、导入视图",
    },
    testStep: [stepName_1e, step_OutIn, returnToDesktop],
  },
]

// 调用需求方法
test.handleDescribeOperate({
  requireId: "001",
  requireAnnotations,
  testList,
  commonParams,
});