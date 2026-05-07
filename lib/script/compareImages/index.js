import { execa } from "execa";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { compareImagesByPx } from "./px.js";

/**
 * 使用特征点对比
 * @param {String} type orb | sift
 * @returns
 */
export function compareImagesByFeature(image1Path, image2Path, diffPath) {
  const pythonPath = join(__dirname, `./feature.py`);
  image1Path = image1Path || join(__dirname, `../../report/test/1.png`);
  image2Path = image2Path || join(__dirname, `../../report/test/2.png`);
  diffPath = diffPath || join(__dirname, `../../report/test/diff-1-2.png`);

  // 创建 Python 子进程
  const python = execa("python", [
    pythonPath,
    image1Path,
    image2Path,
    diffPath,
  ]);

  // 接收 Python 脚本输出
  let data = "";
  python.stdout.on("data", (chunk) => (data += chunk));

  // 处理结束和错误
  return new Promise((resolve, reject) => {
    python.on("close", (code) => {
      if (code !== 0) reject(`Python process exited with code ${code}`);
      else {
        console.log(`特征点差异度分数: ${data} (分数越低表示越相似)`);
        resolve({ mssim: data, result: data <= 15 });
      }
    });
    python.stderr.on("data", (err) => reject(err.toString()));
  });
}
