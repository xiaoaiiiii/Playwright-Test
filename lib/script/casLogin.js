import CryptoJS from "crypto-js";
import md5 from "js-md5";
import qs from "qs";
import fetch from "node-fetch";

const username = "REDACTED_USERNAME";
const password = "REDACTED_PASSWORD";
const casSecretMap = {
  cas: {
    appid: "REDACTED_APPID",
    appkey: "REDACTED_APPKEY",
  },
  castest: {
    appid: "REDACTED_APPID",
    appkey: "REDACTED_APPKEY",
  },
};

const encrypt = (password, appkey) =>
  CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(password),
    CryptoJS.enc.Utf8.parse(appkey),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).ciphertext.toString(CryptoJS.enc.Base64);

const getLoginFetchData = ({
  service,
  username,
  password: originPassword,
  appid,
  appkey,
}) => {
  const password = encrypt(originPassword, appkey);
  const body = { password, service, username };
  const sign = md5(appid + JSON.stringify(body) + appkey).toUpperCase();
  const header = { appid, sign };
  return btoa(JSON.stringify({ header, body }));
};

const loginFetch = ({ isProd, service, username, password, appid, appkey }) =>
  fetch(`https://${isProd ? "cas" : "castest"}.example.cn/v2/api/auto/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs.stringify({
      data: getLoginFetchData({ service, username, password, appid, appkey }),
    }),
  }).then((res) => res.json());

export default async (casAddress, page) => {
  const service = decodeURIComponent(
    casAddress.split("?")[1].replace("service=", "")
  );
  const isProd = casAddress.startsWith("https://cas.example.cn/login");

  const { appid, appkey } = casSecretMap[isProd ? "cas" : "castest"];

  const result = await loginFetch({
    appid,
    appkey,
    username,
    password,
    service,
    isProd,
  });
  // console.log("result==>", result);
  await page.goto(result.data.redirect_to);
  return result.data.redirect_to;
};
