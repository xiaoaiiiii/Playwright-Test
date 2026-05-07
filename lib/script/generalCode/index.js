import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { execa } from "execa";

const __dirname = dirname(fileURLToPath(import.meta.url));

const codegen = async () => {
  const appPath = join(__dirname, "./backend/app.py");
  execa("python", [appPath], { shell: true });
  // 同时导入并执行startApp.js
  try {
    await import("./startApp.js");
  } catch (error) {
    console.error("Failed to import startApp.js:", error);
  }
};


codegen();
