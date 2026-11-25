# 双装配证明要点

## 行为一致性（已自动化）

```bash
npm run verify:dual-assembly
```

对 `doc/transcript/*.txt` 分别以方式 A（无 `--config`）与方式 B（`--config plugins.config.json`）执行，要求 stdout 逐字节相同。空配置 `plugins.config.empty.json` 验证禁用可选插件后 tree 无 `(box)` / `*`。

## git-diff 安装判据（演示用）

Phase 要求接入新插件的提交 `C`：

- **方式 A**：`git diff --name-status C^ C` 只新增插件包，并只改一个顶层装配文件（如 `activateDefaultPlugins.ts`）；不改内核、加载器与既有插件。
- **方式 B**：已有运行代码不动，只新增插件并改 `plugins.config.json`（及必要依赖元数据）。

历史提交中，扩展点与首个插件有时同批落地，**不能**直接用早期 commit 当 `C`。验收时可用独立演示分支 tear-and-reattach：

1. 从当前 HEAD 去掉某插件注册/配置项并提交基线；
2. 再提交仅含「插件包 + 装配或配置」的 `C`；
3. 对 `C` 跑上述 `git diff` 与 `verify:dual-assembly`。

加载器独立性：`src/host/PluginModuleLoader.ts` / `loadPluginsFromConfig.ts` 不得硬编码具体插件 import。

## 当前仓库状态

- 方式 A：`src/host/activateDefaultPlugins.ts`
- 方式 B：仓库根 `plugins.config.json` + `--config`
- E2E：`tests/e2e/Cli.test.ts` 含 A/B 同会话断言
