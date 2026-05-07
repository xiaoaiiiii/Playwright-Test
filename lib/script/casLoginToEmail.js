import { readFileSync } from "node:fs";
import { extname, dirname, join } from "node:path";
import { Blob } from "blob-polyfill";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import { testerEmail } from "../../Configurations/config.js";
import { debounce } from "../utils/index.js";

async function getAccessToken() {
  const url =
    "https://open.f.example.cn/open-apis/auth/v3/tenant_access_token/internal";
  const app_id = "REDACTED_APP_ID";
  const app_secret = "REDACTED_APP_SECRET";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id, app_secret }),
  });
  const data = await response.json();
  return data.tenant_access_token;
}

// 根据扩展名获取MIME类型
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };
  return mimeMap[ext] || "application/octet-stream";
}

function getImageAsBlob(filePath) {
  try {
    const buffer = readFileSync(filePath);
    return new Blob([buffer], { type: getMimeType(filePath) });
  } catch (error) {
    throw new Error(`读取图片失败: ${error.message}`);
  }
}

async function uploadImage(accessToken, imageFile) {
  const url = "https://open.f.example.cn/open-apis/im/v1/images";
  const formData = new FormData();
  formData.append("image_type", "message");
  formData.append("image", imageFile); // 需为File对象或Blob

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const result = await response.json();
  return result.data.image_key; // 示例: img_v2_xxxx [1,4](@ref)
}

async function sendImageAPI(
  accessToken,
  receiveId = "user@example.com",
  imageKey,
  receiveType = "email"
) {
  const url = "https://open.f.example.cn/open-apis/im/v1/messages";
  const body = {
    receive_id: receiveId, // 用户ID或群ID
    msg_type: "image",
    content: JSON.stringify({ image_key: imageKey }),
  };
  const params = new URLSearchParams({ receive_id_type: receiveType });

  const response = await fetch(`${url}?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}

async function sendTextAPI(
  accessToken,
  receiveId = "user@example.com",
  text,
  receiveType = "email"
) {
  const url = "https://open.f.example.cn/open-apis/im/v1/messages";
  const body = {
    receive_id: receiveId, // 用户ID或群ID
    msg_type: "text",
    content: JSON.stringify({ text }),
  };
  const params = new URLSearchParams({ receive_id_type: receiveType });

  const response = await fetch(`${url}?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}

export const casLogin = debounce(async (page) => {
  await page.handle.handleSceenshot("cas", {
    path: `./TestReports/images/cas/login.png`,
  });
  await page.handle.waitTime(1000);
  const accessToken = await getAccessToken();
  const imgPath = join(__dirname, "../../TestReports/images/cas/login.png");
  const imageFile = getImageAsBlob(imgPath);
  const imageKey = await uploadImage(accessToken, imageFile);
  await sendImageAPI(accessToken, testerEmail, imageKey);
  await sendTextAPI(
    accessToken,
    testerEmail,
    "您有测试需要登录，请尽快扫码登录"
  );
}, 5000);
