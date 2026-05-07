/**
 * 通用的工具函数
 */

import { rm, mkdir, readdir, copyFile, readFile, stat } from "fs/promises";
import {
  readFileSync,
  accessSync,
  rmSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import path from "path";
import { join, dirname, basename } from "node:path";
import { execSync } from "child_process";

/**
 * 复制文件夹的函数
 * @param {*} src
 * @param {*} dest
 */
export async function copyFolder(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyFolder(srcPath, destPath);
    } else {
      try {
        await copyFile(srcPath, destPath);
      } catch (error) {
        if (error.code === "ENOENT") {
          await copyFile(srcPath, destPath);
        } else {
          console.log(`复制文件出错: ${error}`);
          throw error;
        }
      }
    }
  }
}

export async function copyAndRename(source, newName) {
  try {
    const sourceDir = dirname(source);
    const destPath = join(sourceDir, newName);

    // 复制并重命名
    await copyFile(source, destPath);

    console.log(`成功复制并重命名为: ${basename(destPath)}`);
    return destPath;
  } catch (error) {
    console.error("复制文件出错:", error);
    throw error;
  }
}

/**
 * 删除文件夹
 * @param {*} dir
 */
export async function rmFolder(dir) {
  try {
    rmSync(dir, { recursive: true, force: true });
    console.log("目录删除成功", dir);
  } catch (err) {
    console.error("删除目录失败:", err);
  }
}

/**
 * 读取文件内容
 * @param {String} path
 * @returns
 */
export async function getFile(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export function isWebAddress(str) {
  const pattern = /^(https?:|ftp:)?\/\/|^www\./i;
  return pattern.test(str);
}

// 读取json文件
export const readJsonFile = (jsonPath) => {
  // const jsonPath = isAbsolute(path) ? path : join(__dirname, path);
  // console.log("jsonPath==>", jsonPath);
  try {
    accessSync(jsonPath);
    const json = readFileSync(jsonPath, { encoding: "utf-8" });
    return JSON.parse(json);
  } catch (error) {
    return false;
  }
};

export async function getPathAllFiles(dirPath, results = []) {
  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // 递归遍历子目录
        await getPathAllFiles(fullPath, results);
      } else if (stats.isFile()) {
        results.push(fullPath); // 存储完整路径
      }
    }

    return results;
  } catch (err) {
    console.error("扫描目录失败:", err);
    return [];
  }
}

/**
 * 生成随机字符
 * @param {Boolean} len
 * @returns
 */
export function randomStr(len = 11) {
  return len <= 11
    ? Math.random()
        .toString(32)
        .slice(2, 2 + len)
        .padEnd(len, "0")
    : randomStr(11) + randomStr(len - 11);
}

/**
 * 生成随机数
 * @param {*} min
 * @param {*} max
 * @returns
 */
export function generateRandom(min = 100, max = 2000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从对象中获取嵌套值
 * @param {Object} obj
 * @param {Array} path
 * @returns
 */
export function getNestedValue(obj, path) {
  if (!path || typeof obj !== "object" || obj === null) return undefined;

  let current = obj;

  for (const key of path) {
    if (current !== null && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * 判断是否是空
 * @param {*} value
 * @returns
 */
export const isEmptyValue = (value) => {
  if (Array.isArray(value)) return !value.length;
  return [undefined, null].includes(value);
};

/**
 * 获取时间戳
 * @returns
 */
export const getTimestamp = () => {
  return new Date().getTime();
};

export function isObject(obj) {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}

export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * json转扁平对象
 * @param {*} json
 * @returns
 */
export function jsonToFlatObject(json) {
  const result = {};

  function flatten(obj, path) {
    if (typeof obj !== "object" || obj === null) {
      if (path.length > 0) result[path.join("-")] = obj;
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => flatten(item, [...path, String(index)]));
      return;
    }
    Object.keys(obj).forEach((key) => flatten(obj[key], [...path, key]));
  }

  Object.keys(json).forEach((key) => flatten(json[key], [key]));

  return result;
}

export function sleepTime(timerout) {
  return new Promise((resolve) => setTimeout(resolve, timerout));
}

export function taskkillPid(pids) {
  pids.forEach((pid) => {
    try {
      execSync(
        `taskkill /PID ${pid} /T /F >nul 2>&1 || wmic process where (ProcessId=${pid}) delete`
      );
      console.log(`成功终止 PID: ${pid}`);
    } catch (killError) {
      console.error(`终止 PID ${pid} 失败:`, killError.message);
    }
  });
}

// 根据名称删除进程
export function killProcessByName(processName) {
  try {
    const output = execSync("tasklist /fo csv /nh").toString();
    const lines = output.trim().split("\n");
    const pids = lines
      .map((line) => line.trim().split(/\s+/)[0].split(","))
      .filter((item) => item[0].includes(processName))
      .map((item) => item[1].match(/\d+/g));
    console.log("Python Name 进程 pids==>", pids);
    taskkillPid(pids);
  } catch (error) {
    if (error.status === 1) {
      console.log(`当前没有运行的 ${processName} 进程`);
    } else {
      console.error("查找进程失败:", error.message);
    }
  }
}

// 关闭python 进程
export function killPythonProcesses() {
  try {
    // 查找 Python 进程
    const output = execSync("tasklist | findstr python", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      shell: true,
    });

    // 提取 PID
    const lines = output.trim().split("\n");
    const pids = lines.map((line) => line.trim().split(/\s+/)[1]);
    console.log("Python 进程 pids==>", pids);

    taskkillPid(pids);
  } catch (error) {
    if (error.status === 1) {
      console.log("当前没有运行的 Python 进程");
    } else {
      console.error("查找进程失败:", error.message);
    }
  }
}

export function ensureFileExists(filePath, content) {
  const dirPath = dirname(filePath);

  try {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      console.log(`📁 目录已创建: ${dirPath}`);
    }
    if (!existsSync(filePath)) {
      writeFileSync(filePath, content, { encoding: "utf-8" });
      console.log(`✅ 创建成功：${filePath}`);
      return true;
    }
    console.log(`📄 文件已存在: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ 错误：${error.message}`);
    return false;
  }
}

export function checkPort(port) {
  return new Promise((resolve) => {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        shell: true,
      });
      // console.log(`${port}端口占用信息:`, output);
      if (output) resolve(output);
    } catch (error) {
      // if (error.status === 1) {
      //   console.log(`端口 ${port} 未被占用==>`);
      // } else {
      //   throw error;
      // }
      resolve(false);
    }
  });
}
