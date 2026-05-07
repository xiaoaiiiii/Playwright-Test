import { getTimestamp, isObject, isEmptyValue } from "../utils/index.js";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { statSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { execSync } from "child_process";

import casLogin from "../script/casLogin.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const videoPath = join(__dirname, "../../TestReports/videos");

export default function useCommonPlaywright(page, testInfo) {
  // 等待
  const waitTime = async (timeout) => {
    await page.waitForTimeout(timeout);
  };

  /**
   * 截图
   * @param {String} testId  测试用例的id
   * @param {String} imageName  图片名称
   */
  const handleSceenshot = async (imageName, options) => {
    const path = join(
      __dirname,
      `../../TestReports/images/${testInfo.title}/${imageName}.png`
    );
    await waitTime(1000);
    await page.screenshot({
      path,
      ...options,
    });

    await waitTime(1000);
    return path;
  };

  /**
   * 添加测试注释
   * @param {*} data 注释信息
   */
  const addTestAnnotations = (data) => {
    if (!isEmptyValue(data) && isObject(data)) {
      data = Object.entries(data).map(([type, description]) => ({
        type,
        description,
      }));
    }
    data.forEach((item) => testInfo.annotations.push(item));
  };

  /**
   * 初始化 阶段注释
   * @param {*} options
   * @param {String} options.operate        // 操作描述
   * @param {String} options.expected       // 预期描述
   * @param {String} options.result         // 结果描述
   * @param {String} options.isSceenshot    // 是否需要截图 默认 true
   * @param {Object} options.compareImgMap        // img1, img2, diffPx, diffFeature
   * @returns
   */
  const addStepAnnotations = async (options) => {
    let {
      id,
      operate,
      expected,
      status,
      compareImgMap,
      isSceenshot = true,
      sceenshotOptions = {},
    } = options;

    id = id || getTimestamp();

    // 阶段信息
    const annotInfo = { id, operate, expected, status };
    if (compareImgMap && Object.keys(compareImgMap)?.length) {
      annotInfo.compareImgMap = compareImgMap;
    }
    // 是否需要截图
    if (isSceenshot) {
      const sceenshotPath = await handleSceenshot(id, sceenshotOptions);
      annotInfo.sceenshotPath = sceenshotPath;
    }

    // 根据阶段状态 来 改变测试状态
    if (!status) {
      testInfo.status = "failed";
    }

    addTestAnnotations({ testStep: JSON.stringify(annotInfo) });
    return annotInfo;
  };

  // /**
  //  * 初始化 阶段注释
  //  * @param {*} options
  //  * @param {Object} options.testInfo       // 当前测试用例的信息
  //  * @param {String} options.operate        // 操作描述
  //  * @param {String} options.expected       // 预期描述
  //  * @param {String} options.result         // 结果描述
  //  * @param {String} options.isSceenshot    // 是否需要截图 默认 true
  //  * @returns
  //  */
  // // 初始化步骤计数器（如果不存在）
  // if (!testInfo.stepCounter) {
  //   testInfo.stepCounter = 1;
  // }

  // const initStepAnnotations = (options) => {
  //   let {
  //     id,
  //     operate,
  //     expected,
  //     isSceenshot = true,
  //     sceenshotOptions = {},
  //   } = options;

  //   id = id || getTimestamp();

  //   // 使用当前步骤计数器并递增
  //   const stepIndex = testInfo.stepCounter++;
  //   const annotInfo = {
  //     id,
  //     operate: `${stepIndex}. ${operate}`,
  //     expected,
  //   };

  //   const addAnnot = async () => {
  //     // 是否需要截图
  //     if (isSceenshot) {
  //       await handleSceenshot(id, sceenshotOptions);
  //     }

  //     // 根据状态改变测试状态
  //     if (!annotInfo.status) {
  //       testInfo.status = "failed";
  //     }

  //     // 添加
  //     testInfo.annotations.push({
  //       type: "testStep",
  //       description: JSON.stringify(annotInfo),
  //     });
  //   };

  //   // 描述信息
  //   return { annotInfo, addAnnot };
  // };

  /**
   * 录制视频
   * @returns
   */
  const handleWebVideo = async () => {
    if (!page.video()) return false;
    const videoPath = await page.video().path();
    addTestAnnotations({ testVideo: videoPath });
  };

  /**
   * 录制视频
   * @returns
   */
  const handleWebViewVideo = (context) => {
    const screenshotsDir = join(videoPath, testInfo.title);
    mkdirSync(screenshotsDir, { recursive: true });
    context.tracing.group("webViewVideo");
    let stopScreeshot = false;
    let timer = null;

    const takeScreenshot = async () => {
      if (stopScreeshot) return false;
      await page.screenshot({
        path: join(screenshotsDir, `${Date.now()}.jpeg`),
      });
      timer = setTimeout(takeScreenshot);
    };

    timer = setTimeout(takeScreenshot);

    return async () => {
      stopScreeshot = true;
      clearTimeout(timer);
      context.tracing.groupEnd();
      await waitTime(1000);

      try {
        const screenshots = readdirSync(screenshotsDir)
          .filter((file) => file.endsWith(".jpeg"))
          .map((file) => ({
            name: file,
            ctime: statSync(join(screenshotsDir, file)).ctimeMs,
          }))
          .sort((a, b) => a.ctime - b.ctime)
          .map(({ name }, index) => ({
            original: name,
            newName: `${index}.jpeg`,
          }));

        screenshots.forEach(({ original, newName }) => {
          renameSync(
            join(screenshotsDir, original),
            join(screenshotsDir, newName)
          );
        });

        const videoId = `${testInfo.title}-${getTimestamp()}`;

        const outputFile = join(videoPath, `${videoId}.mp4`);

        console.log(`开始视频生成，共 ${screenshots.length} 张截图...`);

        execSync(
          `ffmpeg -y -loglevel error -framerate 10 ` +
            `-i "${screenshotsDir}/%d.jpeg" ` +
            `-c:v libx264 -r 30 -pix_fmt yuv420p ` + //.mp4格式
            // `-c:v libvpx-vp9 -c:a libopus ` + //  .WebM格式
            `-filter:v "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1" ` +
            `"${outputFile}"`,
          { stdio: "inherit" } // 实时显示输出
        );

        console.log(`✅ 视频生成成功: ${outputFile}`);

        // 4. 清理截图目录
        rmSync(screenshotsDir, { recursive: true, force: true });
        addTestAnnotations({ testVideo: videoId });
      } catch (error) {
        console.error("视频生成失败:", error);
      }
    };
  };

  const requestUrlMap = {
    ".example.cn/login": casLogin,
  };

  const handleRequest = async () => {
    const url = page.url();
    for (const key of Object.keys(requestUrlMap)) {
      if (url.includes(key)) {
        await requestUrlMap[key](url, page);
        break;
      }
    }
  };
  return {
    waitTime,
    addTestAnnotations,
    addStepAnnotations,
    // initStepAnnotations,

    handleSceenshot,
    handleWebVideo,
    handleWebViewVideo,
    handleRequest,
  };
}

export const useCommonTest = (test) => {
  /**
   * 案例 统一操作
   * @param {Array} testList // 测试案例列表
   * @param {Object} commonParams // 公共参数
   * @param {Object|Array} requireAnnotations // 需求注释
   */
  const handleTestOperate = async (
    testList,
    commonParams = {},
    requireAnnotations = {}
  ) => {
    if (isObject(testList) && !Array.isArray(testList)) testList = [testList];
    testList.forEach((item) => {
      const { testId, annotations, params, testStep } = item;
      test(testId, async ({ page }, testInfo) => {
        page.handle.addTestAnnotations({
          ...requireAnnotations,
          ...annotations,
        });

        for (let step of testStep) {
          if (typeof step !== "function") continue;
          await step({ ...commonParams, ...params, page, testInfo });
        }
      });
    });
  };

  /**
   * 需求 统一操作
   * @param {*} describeList
   */
  const handleDescribeOperate = (describeList) => {
    if (isObject(describeList)) describeList = [describeList];

    describeList.forEach((desc) => {
      const { requireId, requireAnnotations, commonParams, testList } = desc;
      test.describe(requireId, () => {
        handleTestOperate(testList, commonParams, requireAnnotations);
      });
    });
  };

  test.handleTestOperate = handleTestOperate;
  test.handleDescribeOperate = handleDescribeOperate;
};
