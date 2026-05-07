import { projectPath } from "../Configurations/config.js";
import { isWebAddress } from "./utils/index.js";

import { useCommonTest } from "./hooks/useCommonPlaywright.js";

import testWeb from "./webTest/webTest.js";
import testWebView from "./webViewTest/webViewTest.js";

export { expect } from "@playwright/test";
export * from "./utils/index.js";
export * from "./script/compareImages/index.js";

export const test = isWebAddress(projectPath) ? testWeb : testWebView;

useCommonTest(test);
