/**
 * 登录态（storageState）工具
 *
 * 本地用法：
 * - 第一次运行 `npm run code:gen`，浏览器弹出后手动完成登录；
 * - 关闭浏览器窗口前会自动把 cookies / localStorage 写入 storageState.json；
 * - 之后无论是录制（code:gen）还是跑测试（test），都会自动加载该文件，免登录。
 *
 * CI/CD 用法：
 * - 把本地生成的 storageState.json 内容塞进流水线 Secret，变量名 STORAGE_STATE_JSON；
 * - 流水线启动时（playwright.config.ts 入口）会自动还原成文件，后续逻辑无差别。
 *
 * 该文件是登录凭证，已通过 .gitignore 忽略，不要提交到仓库。
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

import { readJsonFile } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 项目根目录: lib/utils -> ../..
export const STORAGE_STATE_PATH = join(
  __dirname,
  "../../Configurations/storageState.json"
);

/**
 * 是否已经有保存的登录态
 * 复用 utils.readJsonFile（不存在/解析失败时返回 false）
 */
export function hasSavedLogin() {
  return readJsonFile(STORAGE_STATE_PATH) !== false;
}

/**
 * 给 browser.newContext() 用的可选参数
 */
export function getStorageStateOption() {
  return hasSavedLogin() ? { storageState: STORAGE_STATE_PATH } : {};
}

/**
 * 保存当前 context 的登录态到磁盘
 * 仅在录制入口（startApp.js）调用；测试用例并发跑时不应回写
 * @param {import('playwright').BrowserContext} context
 */
export async function saveStorageState(context) {
  try {
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`[auth] 登录态已保存: ${STORAGE_STATE_PATH}`);
  } catch (err) {
    console.warn("[auth] 保存登录态失败:", err?.message || err);
  }
}

/**
 * CI 入口：从环境变量 STORAGE_STATE_JSON 还原 storageState.json
 * 已存在则跳过，不覆盖本地开发文件
 * @returns {boolean} 是否成功还原
 */
export function restoreStorageStateFromEnv() {
  if (existsSync(STORAGE_STATE_PATH)) return true;

  const inlineJson = process.env.STORAGE_STATE_JSON;
  if (!inlineJson) return false;

  try {
    JSON.parse(inlineJson); // 校验合法性，避免 Secret 损坏后浪费一次跑流水线
    mkdirSync(dirname(STORAGE_STATE_PATH), { recursive: true });
    writeFileSync(STORAGE_STATE_PATH, inlineJson, "utf-8");
    console.log("[auth] 已从 STORAGE_STATE_JSON 还原登录态");
    return true;
  } catch (err) {
    console.warn("[auth] 还原登录态失败:", err?.message || err);
    return false;
  }
}


