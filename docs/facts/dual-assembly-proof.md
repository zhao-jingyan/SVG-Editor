# 双装配证明要点

## 行为一致性（已自动化）

```bash
npm run verify:dual-assembly
```

- 输入：`doc/transcript/*.txt` 只含命令与注释，不含 `svg>` 提示符或示例输出。
- 会话：`phase1-section6`（Phase 1 §6 完整会话，含 `read other.svg`）、`phase1-flowchart`（§6.1 版本 A）、`box-flowchart`（§6.1 版本 B）、`plugins-session`（`stats`、`dir`、树标签）。
- 运行环境：每次运行把 `doc/transcript/fixtures/` 复制到全新临时目录作为工作目录（`dir` 列表内容固定），输出只保留在内存，失败日志写到该目录之外。
- 预期输出单独保存在 `doc/transcript/expected/`：
  - `<名>.plugins.out`：方式 A 与方式 B 都必须与之逐字节相同（人工复核后录制）；
  - `<名>.baseline.out`：用 `final` 标签构建录制的 Phase 1 输出；禁用全部新增插件（`plugins.config.empty.json`，含树标签）后，HEAD 的输出必须与之逐字节相同。
- 重新录制基线：`git archive final | tar -x -C <目录>` → `npm run build` → `node scripts/verify-dual-assembly.mjs --record-baseline <目录>/dist/main.js`。

## git-diff 安装判据（演示用）

Phase 要求接入新插件的提交 `C`：

- **方式 A**：`git diff --name-status C^ C` 只新增插件包，并只改一个顶层装配文件（`src/assembly/CodePluginInstaller.ts`）；不改内核、加载器与既有插件。
- **方式 B**：已有运行代码不动，只新增插件并改 `plugins.config.json`（及必要依赖元数据）。

历史提交中，扩展点与首个插件有时同批落地，**不能**直接用早期 commit 当 `C`。验收时可用独立演示分支 tear-and-reattach：

1. 从当前 HEAD 去掉某插件注册/配置项并提交基线；
2. 再提交仅含「插件包 + 装配或配置」的 `C`；
3. 对 `C` 跑上述 `git diff` 与 `verify:dual-assembly`。

加载器独立性：`src/host/PluginModuleLoader.ts` / `loadPluginsFromConfig.ts` 不得硬编码具体插件 import。

## 当前仓库状态

- 方式 A：`src/assembly/CodePluginInstaller.ts`
- 方式 B：仓库根 `plugins.config.json` + `--config`
- E2E：`tests/e2e/Cli.test.ts` 含 A/B 同会话断言
