import { test, expect } from "../../lib/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
    compareImagesByPx,
    compareImagesByFeature,
} from "../../lib/script/compareImages/index.js";


const TestFile1 = join(__dirname, "../../lib/TestDataBase/TestFile/testfile_002.blf");
const TestFile2 = join(__dirname, "../../lib/TestDataBase/TestFile/testtemplate.dbc");

const stepName1 = async ({ page, testInfo, ...options }) => {
    await test.step("导入文件", async (stepInfo) => {
        let stepStatus = true;

        // 阶段操作
        await page.locator('div#app > div.o-body:nth-child(2) > div.home-page:nth-child(1) > div.home-tools:nth-child(2) > a.home-tools-box:nth-child(1) > i.home-icon:nth-child(1)').click()
        await page.handle.waitTime(300);
        await page.evaluate((testFilePath) => {
            pywebview.api.choosePath = async () => Promise.resolve(JSON.stringify({ status: "ok", directory: testFilePath }));
        }, TestFile1);  // 第二个参数是要传递给回调的值
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.record-header:nth-child(1) > div.record-header-right:nth-child(2) > div.o-btn:nth-child(1)').click();

        // 校验状态
        try {
            expect(await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(2) > p.o-dialog-item-p:nth-child(2) > span.v-popper--has-tooltip:nth-child(1)')).toHaveText('testfile_002.blf')

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
        //点击选择模板下拉框
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > div.vs__dropdown-toggle:nth-child(1) > div.vs__actions:nth-child(2) > svg.vs__open-indicator:nth-child(2)').click()
        //选择自定义模板
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > ul.vs__dropdown-menu:nth-child(2) > li.vs__dropdown-option:nth-child(1) > div.opt-er:nth-child(1) > div.opt-col:nth-child(1) > div.opt-row:nth-child(9)').click()
        //点击DBC文件按钮
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-content-view:nth-child(2) > div.o-dialog-table:nth-child(2) > div.o-dialog-tabs-wrap:nth-child(1) > div.o-dialog-tab:nth-child(1)').click()
        //导入dbc模板文件
        await page.evaluate((testFilePath) => { pywebview.api.choosePath = () => Promise.resolve(JSON.stringify({ status: "ok", directory: testFilePath })) }, TestFile2);
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-content-view:nth-child(2) > div.o-dialog-table:nth-child(2) > div.o-dialog-table-item:nth-child(3) > div.o-table-item-wrap:nth-child(1) > div.o-input-wrap:nth-child(2) > a.chose-file:nth-child(3)').click();
        //点击确定按钮
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-footer-wrap:nth-child(3) > div.o-dialog-footer:nth-child(1) > div.o-btn:nth-child(2)').click()

        stepStatus = true;
        await page.handle.addStepAnnotations({
            operate: "选择dbc模板",
            expected: "选择模板为自定义模板",
            status: stepStatus,
        });
    });
};

const stepName3 = async ({ page, testInfo, ...options }) => {
    await test.step("选择信号", async (stepInfo) => {
        let stepStatus = true;

        // 阶段操作
        // 判断列表中是否有数据，如果有则删除所有数据
        const treeNodesCount = await page.locator('.tree-node').count();

        if (treeNodesCount > 0) {
            console.log(`列表中有数据，共${treeNodesCount}个节点，开始删除操作`);

            // 将鼠标悬停在第一行
            const firstNode = await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-tree-er:nth-child(3) > div.vtlist:nth-child(1) > div.vtlist-inner:nth-child(1) > div.tree-node:nth-child(1) > div.tree-node-inner:nth-child(1) > div.t-node:nth-child(1) > span.t-node-text:nth-child(3) > span:nth-child(1)');
            await firstNode.hover();
            console.log('鼠标已悬停在第一行节点上');
            // 查找并点击删除按钮
            for (let i = 0; i < treeNodesCount; i++) {

                await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-tree-er:nth-child(3) > div.vtlist:nth-child(1) > div.vtlist-inner:nth-child(1) > div.tree-node:nth-child(1) > div.tree-node-inner:nth-child(1) > div.t-node:nth-child(1) > div.t-node-delete:nth-child(4)').click()

            }
            await page.waitForTimeout(1000);
        } else {
            console.log('列表中没有数据，删除操作完成');
        }

        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.getByText('选择信号').click()

        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(6) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(5) > div.chs-node:nth-child(1)').click()

        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(6) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(6) > div.chs-node:nth-child(1)').click()

        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(6) > div.chs-list-er:nth-child(2) > div.vue-recycle-scroller:nth-child(1) > div.vue-recycle-scroller__item-wrapper:nth-child(1) > div.vue-recycle-scroller__item-view:nth-child(4) > div.chs-node:nth-child(1)').click()

        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-pul-er:nth-child(2) > div.o-column:nth-child(1) > div.o-column-left:nth-child(1) > div.o-resize-save:nth-child(3) > div.o-pul-board:nth-child(1) > div.o-pul-button-wrap:nth-child(2) > div.chs-er:nth-child(6) > div.chs-list-er:nth-child(2) > div.chs-btn:nth-child(4)').click()

        // 获取并记录元素数量
        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        const elementCount = await page.locator('.et-view-er').count();
        console.log(`et-view-er元素数量为：${elementCount}`);

        // 只有断言通过才设置状态为true
        if (elementCount == 4) {
            stepStatus = true;
        } else {
            stepStatus = false;
            // 获取并记录元素数量
            const elementCount = await page.locator('.et-view-er').count();
            console.error(`错误：导入对话框已关闭或不可见，无法进行校验，et-view-er元素数量为：${elementCount}`);
        }

        await page.handle.addStepAnnotations({
            operate: "点击有数据的信号，FEDS_PTFusionCANFD ID为0xa1选择FrntMotSigGrpChks,FrntMotSigGrpCntr,FrntMotMinDynTqCp三个信号点击确定",
            expected: "解析成功三张图对应三个信号的数据",
            status: stepStatus,
        });
    });
};

const compareImgList = [];
const img1Step = async ({ page, testInfo, ...options }) => {
    await page.waitForTimeout(3000);
    await test.step("截图保存自定义模板解析图片", async (stepInfo) => {
        await page.evaluate(() => {
            const dpr = window.devicePixelRatio;
            pywebview.api.resize(1274 * dpr, 697 * dpr);
        });

        let stepStatus = true;

        // 阶段操作
        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.handle.waitTime(200); await page.mouse.move(602, 330); await page.mouse.down(); await page.mouse.move(665, 331); await page.mouse.up()
        // 校验状态
        try {
        } catch (error) {
            stepStatus = false;
        }

        const { sceenshotPath } = await page.handle.addStepAnnotations({
            operate: "截图成功",
            expected: "截图保存自定义模板解析图片成功",
            status: stepStatus,
        });
        compareImgList.push(sceenshotPath);
    });
};
//选择MX11-25RC10模板
const stepName4 = async ({ page, testInfo, ...options }) => {
    await test.step("选择MX11-25RC10模板", async (stepInfo) => {
        let stepStatus = true;

        // 阶段操作
        //点击导入文件按钮
        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.getByText('导入文件').click()
        //点击选择模板下拉框
        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > div.vs__dropdown-toggle:nth-child(1) > div.vs__actions:nth-child(2) > svg.vs__open-indicator:nth-child(2)').click()
        //选择MX11-25RC10模板
        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > ul.vs__dropdown-menu:nth-child(2) > li.vs__dropdown-option:nth-child(1) > div.opt-er:nth-child(1) > div.opt-col:nth-child(1) > div.opt-row:nth-child(3)').click()
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-container-wrap:nth-child(2) > div.o-import-configuration:nth-child(1) > div.o-dialog-item-wrap:nth-child(3) > div.o-dialog-item-select:nth-child(2) > div.v-select:nth-child(1) > ul.vs__dropdown-menu:nth-child(2) > li.vs__dropdown-option:nth-child(1) > div.opt-er:nth-child(1) > div.opt-col:nth-child(2) > div.opt-row:nth-child(1)').click()

        //点击确定按钮
        await page.locator('div#app > div.o-body:nth-child(2) > div.blf-check:nth-child(1) > div.o-import-dialog:nth-child(3) > div.o-dialog-wrap:nth-child(1) > div.o-dialog-footer-wrap:nth-child(3) > div.o-dialog-footer:nth-child(1) > div.o-btn:nth-child(2)').click()
        stepStatus = true;



        await page.handle.addStepAnnotations({
            operate: "选择MX11-25RC10模板",
            expected: "选择模板为MX11-25RC10模板",
            status: stepStatus,
        });
    });
};

const img2Step = async ({ page, testInfo, ...options }) => {
    await page.waitForTimeout(3000);
    await test.step("截图保存MX11-25RC10模板解析图片", async (stepInfo) => {
        await page.evaluate(() => {
            const dpr = window.devicePixelRatio;
            pywebview.api.resize(1274 * dpr, 697 * dpr);
        });

        let stepStatus = true;

        // 阶段操作
        await page.waitForTimeout(500); // 等待0.5秒确保界面稳定
        await page.handle.waitTime(200); await page.mouse.move(602, 330); await page.mouse.down(); await page.mouse.move(665, 331); await page.mouse.up()
        // 校验状态
        try {
        } catch (error) {
            stepStatus = false;
        }

        const { sceenshotPath } = await page.handle.addStepAnnotations({
            operate: "截图成功",
            expected: "截图保存MX11-25RC10模板解析图片成功",
            status: stepStatus,
        });
        compareImgList.push(sceenshotPath);
    });
};
//对比图片
const compareImgStep = async ({ page, testInfo, ...options }) => {
    await test.step("对比自定义模板解析图片和MX11-25RC10模板解析图片", async (stepInfo) => {
        let stepStatus = true;

        // 阶段操作
        const [img1, img2] = compareImgList;

        const diffPx = await page.handle.handleSceenshot("diffPx");

        const diffFeature = await page.handle.handleSceenshot("diffFeature");

        const { result: pxRes } = await compareImagesByPx(img1, img2, diffPx);

        const { result: featureRes } = await compareImagesByFeature(img1, img2, diffFeature);

        // 校验状态
        try {
            if (pxRes && featureRes) {
                stepStatus = true;
            } else {
                stepStatus = false;
            }
        } catch (error) {
            console.log("error==>", error);
            stepStatus = false;
        }

        await page.handle.addStepAnnotations({
            operate: "对比自定义模板解析图片和MX11-25RC10模板解析图片",
            expected: "对比自定义模板解析图片和MX11-25RC10模板解析图片成功",
            status: stepStatus,
            compareImgMap: { img1, img2, diffPx, diffFeature },
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
test.handleTestOperate({
    testId: "TC-TEST-010",
    annotations: {
        inputConditions: "对比图形渲染正确性（截取相同时间段数据保存不同文件类型数据进行解析）",
        expectedResults: "测试成功",
    },
    params: {
        testStatus: true,
        testValue: 0,
    },
    testStep: [stepName1, stepName2, stepName3, img1Step, stepName4, img2Step, compareImgStep, returnToDesktop],
});
