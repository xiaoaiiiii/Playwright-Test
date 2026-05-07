# playwright-test

[playwright 文档](https://playwright.nodejs.cn/docs/intro)

- 目录结构说明
  ```
  - Configurations       配置文件
    - config
  - Packages             测试脚本
  - Lib                  库
  - TestReports          测试报告文件
    - images             测试图片
    - videos             测试视频
    - index.html         测试结果html
    - test-results       测试结果json
  - package.json         依赖和项目脚本
  - playwright.config.ts playwright配置文件
  ```

## 环境安装

- 默认已安装 node v20+ (可选:npm 版本管理 nvm )
  ```
  npm i
  ```

## 测试

- 测试
  - `npm run test`
- 可视化测试
  - `npm run test:ui`
- 生成 PROJ-T 测试配置
  - `npm run config:t`
- PROJ-C 执行测试
  - `npm run test:run`
- 录制脚本
  - `npm run code:gen`
- 需求文档转测试用例
  - `npm run test:import`
