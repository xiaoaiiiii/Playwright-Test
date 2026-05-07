import { dirname, join } from "node:path";

import { generalTestTemp } from "../template/generalTestTemp.js";

import { randomStr, ensureFileExists } from "../utils/index.js";

const generatTest = async () => {
  const dirPath = process.argv.slice(2)[0];
  const testId = `TC-Test-${randomStr(8)}`;
  const configOutPath = join(dirPath, `${testId}.spec.js`);
  const str = await generalTestTemp(testId);
  ensureFileExists(configOutPath, str);
};
generatTest();
