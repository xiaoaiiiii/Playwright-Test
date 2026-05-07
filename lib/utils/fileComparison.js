// 引入 Node.js 模块
import path from "path";
import { promises as fs } from "fs"; // fs.promises 的 ESM 写法
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 严格比较两个JSON文件是否完全一致
 * @param {string} module - 模块名称
 * @param {string} testId - 测试ID
 * @param {string} updateJsonName - 操作的json文件名称
 * @returns {Promise<{isEqual: boolean, error?: string}>} - 比较结果对象
 */
export async function compareJsonFiles(fixturesPath, comparerFile) {
  try {
    // 验证输入参数
    if (!fixturesPath || !comparerFile) {
      throw new Error("fixturesPath和comparerFile参数不能为空");
    }

    // // 构建文件路径（假设文件扩展名为.json）
    // const filePath1 = join(
    //   __dirname,
    //   `../json-file-comparer/${module}/${testId}.json`
    // );
    const comparerPath = join(
      __dirname,
      `../../backup/json-comparer/${comparerFile}`
    );

    // 检查文件是否存在
    await Promise.all([
      checkFileExists(fixturesPath),
      checkFileExists(comparerPath),
    ]);

    // 读取并解析两个JSON文件
    const [data1, data2] = await Promise.all([
      readJsonFile(fixturesPath),
      readJsonFile(comparerPath),
    ]);

    // 使用严格深度比较函数比较解析后的数据
    const isEqual = strictDeepEqual(data1, data2);

    return { isEqual };
  } catch (error) {
    console.error("比较JSON文件失败:", error);
    return { isEqual: false, error: error.message };
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {Promise<void>} - 如果文件不存在则抛出错误
 */
async function checkFileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
  } catch (error) {
    throw new Error(`文件不存在: ${filePath}`);
  }
}

/**
 * 读取并解析JSON文件（Node.js环境）
 * @param {string} filePath - JSON文件路径
 * @returns {Promise<any>} - 解析后的JSON数据
 */
async function readJsonFile(filePath) {
  try {
    // 读取文件内容
    const content = await fs.readFile(filePath, "utf8");
    // 解析JSON
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON解析错误 (${filePath}): ${error.message}`);
    }
    throw new Error(`读取文件失败 (${filePath}): ${error.message}`);
  }
}

/**
 * 严格深度比较两个值是否完全一致（包括对象键顺序、数据类型、特殊对象）
 * @param {any} value1 - 第一个值
 * @param {any} value2 - 第二个值
 * @param {WeakSet} [visited1=new WeakSet()] - 用于检测循环引用的弱集合
 * @param {WeakSet} [visited2=new WeakSet()] - 用于检测循环引用的弱集合
 * @returns {boolean} - 如果完全一致返回true，否则返回false
 */
function strictDeepEqual(
  value1,
  value2,
  visited1 = new WeakSet(),
  visited2 = new WeakSet()
) {
  // 处理相同引用或原始值相等的情况
  if (value1 === value2) return true;

  // 处理null和undefined
  if (value1 === null || value2 === null) return value1 === value2;

  // 处理原始值类型（包括Symbol、BigInt等）
  const type1 = typeof value1;
  const type2 = typeof value2;
  if (type1 !== "object" || type2 !== "object") return value1 === value2;

  // 处理循环引用
  if (visited1.has(value1) || visited2.has(value2)) {
    return visited1.has(value1) && visited2.has(value2);
  }
  visited1.add(value1);
  visited2.add(value2);

  // 处理特殊对象类型（Date、RegExp、Set、Map等）
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime();
  }
  if (value1 instanceof RegExp && value2 instanceof RegExp) {
    return value1.source === value2.source && value1.flags === value2.flags;
  }
  if (value1 instanceof Set && value2 instanceof Set) {
    if (value1.size !== value2.size) return false;
    const arr1 = Array.from(value1).sort();
    const arr2 = Array.from(value2).sort();
    return arr1.every((v, i) =>
      strictDeepEqual(v, arr2[i], visited1, visited2)
    );
  }
  if (value1 instanceof Map && value2 instanceof Map) {
    if (value1.size !== value2.size) return false;
    const entries1 = Array.from(value1.entries()).sort();
    const entries2 = Array.from(value2.entries()).sort();
    return entries1.every(([k1, v1], i) => {
      const [k2, v2] = entries2[i];
      return (
        strictDeepEqual(k1, k2, visited1, visited2) &&
        strictDeepEqual(v1, v2, visited1, visited2)
      );
    });
  }

  // 区分对象和数组
  const isArray1 = Array.isArray(value1);
  const isArray2 = Array.isArray(value2);
  if (isArray1 !== isArray2) return false;

  // 数组比较（严格顺序）
  if (isArray1) {
    if (value1.length !== value2.length) return false;
    for (let i = 0; i < value1.length; i++) {
      if (!strictDeepEqual(value1[i], value2[i], visited1, visited2))
        return false;
    }
    return true;
  }

  // 对象比较（严格键顺序和值相等）
  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);
  if (keys1.length !== keys2.length) return false;

  // 检查键的顺序和值是否完全一致
  for (let i = 0; i < keys1.length; i++) {
    const key1 = keys1[i];
    const key2 = keys2[i];
    if (key1 !== key2) return false; // 键名和顺序必须一致
    if (!strictDeepEqual(value1[key1], value2[key2], visited1, visited2))
      return false;
  }

  return true;
}
