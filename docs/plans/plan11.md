# Plan11：CLI 进程级端到端测试

## 摘要

- 使用真实 `dist/main.js` 子进程验证 stdin/stdout/退出码，而不是只在进程内替换 IO。
- 增加 `npm run cli` 与 `test:e2e` 脚本，固定 CLI 的自动化验收入口。

## 实现

- `tests/e2e/Cli.test.ts` 在测试前执行 `npm run build`，随后通过 `spawnSync` 启动 `node dist/main.js`。
- 输出断言去掉提示符 `svg> `，逐行校验成功消息、错误消息和顺序。
- 覆盖完整编辑链路、失败后继续执行、历史锁以及 stdin EOF 退出。
- `npm run cli` 与文档中的启动命令保持一致；`test:e2e` 先 build 再运行 E2E。

## 验证

- `npm test`、`npm run build`、`npm run test:e2e` 全部通过。
