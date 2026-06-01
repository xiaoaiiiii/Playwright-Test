/**
 * 登录态获取脚本（独立入口）
 *
 * 用途：
 * - 打开有头浏览器；
 * - 通过状态机识别两种登录链路：
 *     A) 未登录：进入登录页 → 用户手动登录 → 跳回业务页 → 自动完成；
 *     B) 已登录（续签 / token 仍有效）：直接命中业务页 → 观察期内未被踢去登录页 → 自动完成。
 * - 用户手动关闭浏览器也会触发兜底保存。
 *
 * 触发时机：
 * - 首次使用项目；
 * - 登录态过期（测试被重定向到登录页，或接口 401）；
 * - 切换登录账号。
 *
 * 状态机：
 *   waiting_redirect  打开 projectPath 后的初始状态
 *     ├─ 命中登录页 → at_login_page
 *     └─ 命中业务页且 INITIAL_GRACE_MS 内无登录页跳转 → 直接 finish（已登录场景）
 *   at_login_page     已进入第三方登录域（auth.* 等非 projectPath origin）
 *     └─ 跳回业务页且 STABLE_MS 内不再跳转 → finish（手动登录成功场景）
 */

import { URL } from "node:url";

import playwright from "playwright";

import {
  getStorageStateOption,
  saveStorageState,
  hasSavedLogin,
} from "../../utils/index.js";

import { projectPath } from "../../../Configurations/config.js";

// 登录跳回业务页面后，URL 稳定多久才视为完成（去抖）
const STABLE_MS = 1500;
// 已登录场景：命中业务页后再观察多久确认不会被踢去登录页
const INITIAL_GRACE_MS = 3000;
// 整体超时（ms），仅打印提示，不强退
const OVERALL_TIMEOUT_MS = 10 * 60 * 1000;

const targetUrl = new URL(projectPath);
const targetOrigin = targetUrl.origin;
const targetPath = targetUrl.pathname.replace(/\/+$/, "");

/** 是否仍在业务地址（origin + pathname 前缀，hash/query 忽略） */
const isBusinessUrl = (urlStr) => {
  try {
    const u = new URL(urlStr);
    if (u.origin !== targetOrigin) return false;
    const curPath = u.pathname.replace(/\/+$/, "");
    return targetPath === "" || curPath === targetPath || curPath.startsWith(targetPath + "/");
  } catch {
    return false;
  }
};

/** 是否在登录/鉴权页（非业务 origin 且 http(s) 协议） */
const isLoginUrl = (urlStr) => {
  try {
    const u = new URL(urlStr);
    if (!/^https?:$/.test(u.protocol)) return false;
    return u.origin !== targetOrigin;
  } catch {
    return false;
  }
};

const runLogin = async () => {
  console.log(
    hasSavedLogin()
      ? "[auth] 检测到已保存的登录态，本次将在其基础上续签；如需换账号请在浏览器中先登出。"
      : "[auth] 未检测到登录态，请在弹出的浏览器中完成 OA 登录。"
  );
  console.log("[auth] 登录态有效或登录成功后，脚本会自动保存并关闭浏览器，无需手动操作。");

  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext(getStorageStateOption());
  const page = await context.newPage();

  /** @type {'waiting_redirect' | 'at_login_page' | 'finishing'} */
  let phase = "waiting_redirect";
  let finishing = false;
  let stableTimer = null;

  const clearStable = () => {
    if (stableTimer) {
      clearTimeout(stableTimer);
      stableTimer = null;
    }
  };

  const finish = async (reason) => {
    if (finishing) return;
    finishing = true;
    phase = "finishing";
    clearStable();

    console.log(`[auth] ${reason}，正在保存登录态…`);
    try {
      await saveStorageState(context);
    } catch (err) {
      console.warn("[auth] 保存登录态失败:", err?.message || err);
    }
    try {
      await browser.close();
    } catch {}
    process.exit(0);
  };

  const handleUrlChange = (url) => {
    if (finishing) return;

    if (isLoginUrl(url)) {
      // 进入登录页：取消任何在跑的稳定计时器
      clearStable();
      if (phase !== "at_login_page") {
        phase = "at_login_page";
        console.log("[auth] 已进入登录页，请手动完成账号密码登录…");
      }
      return;
    }

    if (!isBusinessUrl(url)) return;

    // 命中业务页 —— 根据当前阶段选择稳定窗口
    clearStable();
    if (phase === "at_login_page") {
      // 手动登录后跳回：1.5s 稳定即可
      stableTimer = setTimeout(
        () => finish("检测到已从登录页跳回业务页面，登录成功"),
        STABLE_MS
      );
    } else if (phase === "waiting_redirect") {
      // 已登录场景：给 3s 观察期，期间未被踢回登录页就算有效
      stableTimer = setTimeout(
        () => finish("检测到登录态有效，已直接进入业务页面"),
        INITIAL_GRACE_MS
      );
    }
  };

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) handleUrlChange(frame.url());
  });

  // 兜底：用户手动关窗口
  context.on("close", async () => {
    if (finishing) return;
    finishing = true;
    clearStable();
    console.log("[auth] 检测到浏览器关闭，正在保存登录态…");
    try {
      await saveStorageState(context);
    } catch (err) {
      console.warn("[auth] 保存登录态失败:", err?.message || err);
    }
    process.exit(0);
  });

  // 整体超时：仅提示，不强退
  setTimeout(() => {
    if (!finishing) {
      console.warn(
        "[auth] 等待登录超时（10 分钟），如已登录可手动关闭浏览器，脚本会兜底保存登录态。"
      );
    }
  }, OVERALL_TIMEOUT_MS);

  await page.goto(projectPath);

  // page.goto 完成后，主框架可能早已稳定停留在业务页（已登录场景），
  // 此时 framenavigated 不会再触发；主动检查一次当前 URL，避免漏判。
  if (!finishing) handleUrlChange(page.url());
};

runLogin().catch((err) => {
  console.error("[auth] 登录脚本异常:", err);
  process.exit(1);
});
