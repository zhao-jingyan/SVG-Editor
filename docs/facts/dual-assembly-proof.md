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

## git-diff 安装判据（演示分支）

扩展点与首批插件在历史上同批落地，不能直接用早期提交当 `C`。仓库提供两个本地演示分支（均基于接入全部整改后的 `main`，**未推送**），各自只新增一个 `ping` 命令插件（`src/_plugin/commands/PingCommand/`，含 `package.json` 的 `contributes.commands = ["ping"]`）：

| 分支 | 接入方式 | `git diff --name-status C^ C` |
|---|---|---|
| `demo/plugin-via-code` | A：改代码 | 新增 5 个插件包文件 + 1 个测试；唯一被修改的运行代码是 `src/assembly/CodePluginInstaller.ts` |
| `demo/plugin-via-config` | B：改配置 | 新增 5 个插件包文件 + 1 个测试；唯一被修改的文件是 `plugins.config.json`，运行代码零修改 |

两个分支都满足：

```bash
# 排除新插件包后，内核、加载器与既有插件的差异必须为空；同时确认新插件路径确实存在
git diff C^ C -- src/protocol src/core src/cli src/_builtin src/host \
  src/_plugin/commands/StatsCommand src/_plugin/commands/DirCommand \
  src/_plugin/shapes src/_plugin/tree ':(exclude)src/_plugin/commands/PingCommand'
git cat-file -e "C:src/_plugin/commands/PingCommand/PingCommandPlugin.ts"
```

方式 B 的运行验证：在 `demo/plugin-via-config` 上 `npm run build` 后，`echo ping | node dist/main.js --config plugins.config.json` 输出 `pong`；不带 `--config` 的默认（方式 A）仍报 `unknown command: ping`——这正说明 B 不改代码即生效。必要的依赖元数据变更：无（`package.json` 与锁文件均未改；插件自带的 `package.json` 是其清单）。

加载器独立性：`src/host` 下的导入只指向 `node:*`、`protocol`、`core` 与 host 自身，不含任何具体插件包、名称映射表或按插件名的分支（`rg -n "import|require|switch" src/host` 仅辅助人工检查；具体插件只出现在 `src/assembly/CodePluginInstaller.ts` 与配置文件）。

## 当前仓库状态

- 方式 A：`src/assembly/CodePluginInstaller.ts`
- 方式 B：仓库根 `plugins.config.json` + `--config`
- 演示分支：`demo/plugin-via-code`、`demo/plugin-via-config`（本地，不合并进 `main`）
- E2E：`tests/e2e/Cli.test.ts` 含 A/B 同会话断言
