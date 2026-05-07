import fs from "fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { ssim } from "ssim.js";
import { PNG } from "pngjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createDiff(options) {
  const { diffBuffer, width, height, outputPath } = options;
  // 生成差异图
  await sharp(diffBuffer, {
    raw: {
      width,
      height,
      channels: 4,
    },
  }).toFile(outputPath);
}

async function createDiffOverlay(options) {
  const { image1Path, diffBuffer, width, height, outputPath } = options;
  try {
    // 将差异缓冲区转换为可用的图像格式
    const diffImage = await sharp(diffBuffer, {
      raw: { width, height, channels: 4 },
    })
      .toFormat("png") // 明确指定输出格式
      .toBuffer();

    // 合成叠加图
    await sharp(image1Path)
      .composite([{ input: diffImage, blend: "multiply", premultiplied: true }])
      .toFile(outputPath);

    console.log("差异叠加图生成成功");
  } catch (err) {
    console.error("叠加图生成失败:", err);
    throw err;
  }
}

async function calculateSSIM(imagePath1, imagePath2) {
  try {
    // 1. 读取并预处理两张图像
    const image1 = await prepareImage(imagePath1);
    const image2 = await prepareImage(imagePath2);

    // 2. 确保图像尺寸相同
    if (image1.width !== image2.width || image1.height !== image2.height) {
      const maxWidth = Math.max(image1.width, image2.width);
      const maxHeight = Math.max(image1.height, image2.height);

      // 调整图像尺寸
      image1.data = await resizeImage(image1, maxWidth, maxHeight);
      image2.data = await resizeImage(image2, maxWidth, maxHeight);

      image1.width = maxWidth;
      image1.height = maxHeight;
      image2.width = maxWidth;
      image2.height = maxHeight;
    }

    // 3. 计算SSIM
    const ssimResult = ssim(image1, image2);
    return {
      mssim: ssimResult.mssim,
      performance: ssimResult.performance,
      width: image1.width,
      height: image1.height,
    };
  } catch (error) {
    console.error("Error calculating SSIM:", error);
    throw error;
  }
}

async function prepareImage(imagePath) {
  // 将图像转为RGBA格式
  const buffer = await sharp(imagePath)
    .ensureAlpha() // 确保有alpha通道
    .toFormat("png")
    .toBuffer();

  // 将图像转换为SSIM所需的格式
  const { width, height, data } = PNG.sync.read(buffer);

  return { width, height, data };
}

async function resizeImage(image, width, height) {
  const buffer = await sharp(Buffer.from(image.data), {
    raw: {
      width: image.width,
      height: image.height,
      channels: 4, // RGBA
    },
  })
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFormat("png")
    .toBuffer();

  return PNG.sync.read(buffer).data;
}

export async function compareImagesByPx(image1Path, image2Path, outputPath) {
  try {
    // 读取并解码两张图片
    const image1 = await sharp(image1Path).ensureAlpha().raw().toBuffer();
    const image2 = await sharp(image2Path).ensureAlpha().raw().toBuffer();

    // 获取图片元数据
    const metadata = await sharp(image1Path).metadata();
    const { width, height } = metadata;

    // 验证图片尺寸
    const metadata2 = await sharp(image2Path).metadata();
    if (width !== metadata2.width || height !== metadata2.height) {
      throw new Error("Images must have the same dimensions");
    }

    // 创建差异图片缓冲区
    const diffBuffer = Buffer.alloc(image1.length);

    // 计算差异像素
    const numDiffPixels = pixelmatch(
      image1,
      image2,
      diffBuffer,
      width,
      height,
      {
        threshold: 0.01, // 差异阈值 (0-1)
        alpha: 0.3,
        includeAA: true, // 是否包含抗锯齿
        diffColorAlt: [0, 255, 0],
        diffMask: false, // 生成差异蒙版
      }
    );

    const { mssim } = await calculateSSIM(image1Path, image2Path);

    console.log(`像素差异数量: ${numDiffPixels}, 相似度：${mssim}`);

    // 生成差异图
    await createDiff({
      diffBuffer,
      width,
      height,
      outputPath,
    });

    // createDiffOverlay({
    //   image1Path,
    //   diffBuffer,
    //   width,
    //   height,
    //   outputPath,
    // });
    return {
      diffPixels: numDiffPixels,
      diffBuffer: diffBuffer.length,
      mssim,
      result: mssim > 0.8,
    };
  } catch (err) {
    console.error("比较出错:", err);
    throw err;
  }
}

// // 使用示例
// (async () => {
//   const image1Path = join(
//     __dirname,
//     `../report/images/TC-BLF-Reader-v3-101/1749559486382.png`
//   );
//   const image2Path = join(
//     __dirname,
//     `../report/images/TC-BLF-Reader-v3-101/1749559516586.png`
//   );
//   const outputPath = join(
//     __dirname,
//     `../report/images/TC-BLF-Reader-v3-101/diff.png`
//   );
//   await compareImages(image1Path, image2Path, outputPath);
// })();
