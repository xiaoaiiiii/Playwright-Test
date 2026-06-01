/**
 * 鲁棒定位工具集（面向 Element-Plus / Vue 应用，亦适用于通用页面）
 *
 * 设计原则：语义优先 + 作用域收窄 + 多策略回退。
 *   - 优先用 role / label / placeholder / text 这类“人能看懂”的语义定位；
 *   - 复杂控件先锁定一个稳定容器（如某个 el-form-item），再在容器内相对定位；
 *   - 多个候选用 resolve() 串成“优先级回退链”，任一命中即用，互为兜底。
 *
 * 与录制器生成的绝对 CSS 路径相比，这里的定位方式不依赖 nth-child 位置索引、
 * 不绑死布局结构，UI 微调 / 表单增减项 / 响应式换行后通常仍然有效。
 *
 * 用法示例见每个函数的 JSDoc。
 */

/**
 * 优先级回退链：依次尝试一组定位策略，返回第一个在 timeout 内“挂载到 DOM”的 locator。
 *
 * 与 Playwright 原生 `.or()` 的区别：
 *   - `.or()` 是“匹配 A 或 B”，两者同时存在会触发 strict 模式多元素报错；
 *   - resolve() 是真正的“先 A 后 B”优先级，A 找不到才退到 B。
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} root
 * @param {Array<(root) => import('@playwright/test').Locator>} builders 候选定位器构造函数（按优先级排列）
 * @param {{ timeout?: number, state?: 'attached'|'visible' }} [opts]
 * @returns {Promise<import('@playwright/test').Locator>} 命中的 locator（已 .first()）
 *
 * @example
 * const btn = await resolve(page, [
 *   p => p.getByRole('button', { name: '搜索' }),
 *   p => p.getByText('搜索', { exact: true }),
 *   p => p.locator('button:has-text("搜索")'),
 * ]);
 * await btn.click();
 */
export async function resolve(root, builders, opts = {}) {
  const { timeout = 5000, state = "attached" } = opts;
  const per = Math.max(500, Math.floor(timeout / builders.length));
  let lastErr = null;
  for (const build of builders) {
    const loc = build(root).first();
    try {
      await loc.waitFor({ state, timeout: per });
      return loc;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `[locators] 所有候选定位策略均未命中目标元素。最后一次错误: ${lastErr?.message || lastErr}`
  );
}

/**
 * “匹配任一”回退链（基于原生 .or()）：当你确信页面上同一时刻只会出现其中一种形态时用它，
 * 好处是保留 Playwright 的自动等待与自动重试，无需 await 预解析。
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} root
 * @param {Array<(root) => import('@playwright/test').Locator>} builders
 * @returns {import('@playwright/test').Locator}
 *
 * @example
 * await anyOf(page, [
 *   p => p.getByRole('button', { name: '确定' }),
 *   p => p.getByText('确认'),
 * ]).click();
 */
export function anyOf(root, builders) {
  let loc = null;
  for (const build of builders) {
    const cur = build(root);
    loc = loc ? loc.or(cur) : cur;
  }
  return loc;
}

/**
 * 定位 Element-Plus 表单项（el-form-item）内部的控件。
 * 通过“标签文本”锁定 form-item，再返回其内容区 el-form-item__content。
 * 不依赖位置索引，表单增减项后依然有效。
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} root
 * @param {string} label form-item 的标签文本（如 "作业编号"）
 * @param {{ exact?: boolean }} [opts]
 * @returns {import('@playwright/test').Locator} 该 form-item 的内容区 locator
 *
 * @example
 * await formItem(page, '作业编号').locator('input').fill('A001');
 * await formItem(page, '产线').click(); // 打开下拉
 */
export function formItem(root, label, opts = {}) {
  const { exact = false } = opts;
  const labelText = exact
    ? new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`)
    : label;
  return root
    .locator(".el-form-item", {
      has: root.page().locator(".el-form-item__label", { hasText: labelText }),
    })
    .first()
    .locator(".el-form-item__content");
}

/**
 * 按占位符定位输入框（Element-Plus 的 input 多数带 placeholder）。
 * 比 getByPlaceholder 多一层 :visible 过滤，避开隐藏的折叠区域输入框。
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} root
 * @param {string} placeholder
 * @returns {import('@playwright/test').Locator}
 *
 * @example
 * await byPlaceholder(page, '任务编号').fill('T123');
 */
export function byPlaceholder(root, placeholder) {
  return root.getByPlaceholder(placeholder);
}

/**
 * 定位按钮：role 优先，回退到文本匹配的 el-button。
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} root
 * @param {string} name 按钮文字（如 "搜索" / "重置" / "分配"）
 * @returns {Promise<import('@playwright/test').Locator>}
 *
 * @example
 * (await button(page, '搜索')).click();
 */
export function button(root, name) {
  return resolve(root, [
    (r) => r.getByRole("button", { name }),
    (r) => r.locator(`button:has-text("${name}")`),
    (r) => r.locator(".el-button", { hasText: name }),
  ]);
}

/**
 * 操作 Element-Plus 的 el-select：先点开下拉，再按文本选中选项。
 * el-select 的下拉浮层会 teleport 到 body，且可能同时存在多个，因此用 :visible 过滤。
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} selectTrigger 下拉触发器（通常是 formItem(...).locator('.el-select')）
 * @param {string} optionText 要选中的选项文本
 *
 * @example
 * await selectOption(page, formItem(page, '产线').locator('.el-select'), 'X 产线');
 */
export async function selectOption(page, selectTrigger, optionText) {
  await selectTrigger.click();
  const option = page
    .locator(".el-select-dropdown:visible .el-select-dropdown__item", {
      hasText: optionText,
    })
    .first();
  await option.click();
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
