// 生成测试报告 html

import { fileURLToPath, URL } from "node:url";
import { dirname, join, extname, basename, isAbsolute } from "node:path";
import { writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const reportPath = join(__dirname, "../../TestReports");
const htmlTempPath = join(__dirname, "../template/overview.html");
const testJsonPath = join(reportPath, "test-results.json");
const htmlOutPath = join(reportPath, "index.html");
const imagesPath = join(reportPath, "images");

const reportJSOnPath = join(reportPath, "test-case.json");

import { randomStr, readJsonFile } from "../utils/index.js";

// 获取所有的图片
function getAllPNGFilesSync(dirPath, results = []) {
  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        getAllPNGFilesSync(fullPath, results);
      } else if (stats.isFile()) {
        const fileName = basename(fullPath, extname(fullPath));
        results.push(fileName);
      }
    }

    return results;
  } catch (err) {
    return [];
  }
}

// 添加注释信息
function processAnnotations(targetObj, annotations = [], keys) {
  annotations.forEach(({ type, description }) => {
    if (type === "testStep") {
      targetObj.testSetps.push(JSON.parse(description));
      return false;
    }
    keys.includes(type) && (targetObj[type] = description);
  });
}

function createBaseObject(obj) {
  const { id = randomStr(), title } = obj;
  return {
    id,
    title,
    requireDesc: "",
    step: "",
    inputConditions: "",
    expectedResults: "",
    screenshot: "",
    testSetps: [],
    status: "",
    startTime: "",
    duration: "",
  };
}

function handleSpecs(specs, list) {
  specs.forEach((spec) => {
    spec.tests.forEach((test) => {
      const result =
        test.results?.find?.((item) => item.status === "passed") ||
        test.results?.[0] ||
        {};
      const specObj = createBaseObject(spec);

      specObj.type = "test";

      specObj.status = result.status;
      specObj.startTime = result.startTime;
      specObj.duration = `${result.duration}ms`;
      specObj.url = `./detail/index.html#?testId=${spec.id}`;

      const keys = ["inputConditions", "expectedResults", "testVideo"];
      processAnnotations(specObj, test.annotations, keys);

      const images = getAllPNGFilesSync(join(imagesPath, spec.title));
      specObj.screenshot = images.reduce((obj, name) => {
        obj[name] = `./images/${spec.title}/${name}.png`;
        return obj;
      }, {});
      // specObj.screenshot = specObj.testSetps.reduce((obj, item) => {
      //   obj[item.id] = `./images/${spec.title}/${item.id}.png`;
      //   return obj;
      // }, {});

      const video = specObj.testVideo;
      if (video) {
        const path = isAbsolute(video) ? video : `./videos/${video}.mp4`;
        specObj.testVideo = path;
      }
      list.push(specObj);
    });
  });
}

function handleSubSuites(subSuites, list) {
  subSuites.forEach((subSuite) => {
    let suiteObj = createBaseObject(subSuite);

    suiteObj.type = "require";
    suiteObj.children = [];

    const firstTest = subSuite.specs?.[0]?.tests?.[0];
    if (firstTest) {
      const keys = ["testName", "requireDesc", "step"];
      processAnnotations(suiteObj, firstTest.annotations, keys);
    }

    list.push(suiteObj);
    handleSpecs(subSuite.specs, suiteObj.children);
  });
}

export function traverseSuites(suites, list) {
  let tool = "";
  suites.forEach((suite) => {
    tool = suite.file.split("/")[0];
    if (suite.specs?.length) handleSpecs(suite.specs, list);
    if (suite.suites?.length) handleSubSuites(suite.suites, list);
  });
  return tool;
}

export default async function generalReport(path = testJsonPath) {
  const testJson = readJsonFile(path);
  if (!testJson) return false;
  const data = [];
  const tool = traverseSuites(testJson.suites, data);

  const html = readFileSync(htmlTempPath, { encoding: "utf-8" });
  // 要插入的脚本内容
  const scriptContent = `run({result:${JSON.stringify(data)}})`;
  const modifiedHtml = html.replace(/####/i, `\n${scriptContent}\n`);

  const reportData = JSON.stringify({ [tool]: data });

  try {
    writeFileSync(htmlOutPath, modifiedHtml, { encoding: "utf-8" });
    writeFileSync(reportJSOnPath, reportData, { encoding: "utf-8" });
    console.log("生成测试报告成功:", htmlOutPath);
  } catch (error) {
    console.error("写入文件失败:", error);
  }
}

// generalReport();
