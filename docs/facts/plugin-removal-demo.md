# 插件删除→加回演示：失败测试记录与 git diff 验证

## 背景

在 `main` 上对四个插件（`stats`、`dir`、`box`、`modified-star`）各做一对提交：

- `delete-plugin-<名>`：删除插件包目录、插件自身的测试目录，并从装配入口 `src/assembly/CodePluginInstaller.ts` 与配置 `plugins.config.json` 中去掉该插件的入口。
- `install-plugin-<名>`：把上一提交（即 `delete-plugin-<名>^`）中的上述文件整文件恢复。

基线为 `5d0b570`（`docs: 登记 Phase 2 验收 e2e 命令与覆盖范围`）。删除提交允许变红（测试与期望输出仍引用该插件，未修改），失败的测试逐条记录如下。

## 演示脚本

步骤由 `scripts/demo/demo_step.py` 完成，每次删除或加回后依次执行构建、`npm test`（输出 JSON 报告）、`npm run lint`、`npm run verify:dual-assembly`、`npm run e2e`，并把结果写入提交正文。

```bash
python3 scripts/demo/demo_step.py delete <名>   # <名> ∈ stats | dir | box | modified-star
python3 scripts/demo/demo_step.py install <名>
```

注意：脚本会创建提交并打 `delete-plugin-<名>` / `install-plugin-<名>` 标签，且 `delete` 会删除插件文件。只能在可丢弃的演示分支上运行，不要在 `main` 上直接执行。日志与提交信息临时文件位于系统临时目录下的 `svg-editor-demo/`。

## 提交与标签

| 插件 | delete 提交 | 标签 | install 提交 | 标签 |
|---|---|---|---|---|
| stats | `238b3e3` | `delete-plugin-stats` | `cce456d` | `install-plugin-stats` |
| dir | `5a8b0d1` | `delete-plugin-dir` | `ed6d042` | `install-plugin-dir` |
| box | `c30d2e9` | `delete-plugin-box` | `64b3778` | `install-plugin-box` |
| modified-star | `0df3258` | `delete-plugin-modified-star` | `a828a27` | `install-plugin-modified-star` |

每个提交的正文同样记录了本步的构建、测试、lint、双装配和 e2e 结果。

## 删除提交的失败测试

`npm test` 的结果、`npm run lint`、`npm run verify:dual-assembly`、`npm run e2e` 均在每个删除提交的正文中。`lint` 与 `e2e` 在四个删除提交中都通过；`verify:dual-assembly` 都失败（转录会话引用了被删插件）。

### 删除 stats（`238b3e3`）

共 203 项，通过 195，失败 8 项，另有 2 个文件级导入错误。

- `tests/assembly/CodePluginInstaller.test.ts`：方式 A 装入默认插件集合
- `tests/e2e/Cli.test.ts`：方式 A 与 `--config` 方式 B 对同一会话输出一致
- `tests/e2e/Phase2Acceptance.test.ts`：help 列出 stats 与 dir；stats 统计规则；空文档 stats 与 undo 栈；dir 读取失败后继续（该用例依赖 stats 的 help 与 init 输出）；`plugins-session` 双装配逐字节一致；加载器四条失败路径与重复注册
- `tests/host/PluginHost.test.ts`：文件级导入错误（`@/_plugin/commands/StatsCommand/StatsCommand`）
- `tests/protocol/ExtensionPointHierarchy.test.ts`：文件级导入错误（`@/_plugin/commands/StatsCommand/StatsCommandContribution`）

### 删除 dir（`5a8b0d1`）

共 205 项，通过 198，失败 7 项。

- `tests/assembly/CodePluginInstaller.test.ts`：方式 A 装入默认插件集合
- `tests/e2e/Phase2Acceptance.test.ts`：help 列出 stats 与 dir；dir 无需文档即可使用（排序与符号链接）；dir 空目录输出；已有文档时 dir 不改 undo；dir 读取失败后继续；`plugins-session` 双装配逐字节一致
- `tests/protocol/ExtensionPointHierarchy.test.ts`：文件级导入错误（`@/_plugin/commands/DirCommand/DirCommandContribution`）

### 删除 box（`c30d2e9`）

共 199 项，通过 187，失败 12 项，另有 2 个文件级导入错误。

- `tests/assembly/CodePluginInstaller.test.ts`：方式 A 装入默认插件集合
- `tests/e2e/Cli.test.ts`：方式 A 与方式 B 对同一会话输出一致
- `tests/e2e/Phase2Acceptance.test.ts`：stats 统计规则（box 内部叶子计入）；§3 box 的 fill/label undo 单元；§4 box 的 in/move/ungroup、id 冲突、必要子部件保护、`data-kind` 读回与降级、缺子部件与重复 id 的读入拒绝；§5 `(box) *` 并存；§6 `box-flowchart` 与 `plugins-session` 双装配逐字节一致
- `tests/integration/TreeLabelsTogether.test.ts`：文件级导入错误（`@/_plugin/shapes/BoxShape/BoxAttributeHandler`）
- `tests/protocol/ExtensionPointHierarchy.test.ts`：文件级导入错误（`@/_plugin/shapes/BoxShape/BoxAttributeHandler`）

### 删除 modified-star（`0df3258`）

共 201 项，通过 191，失败 10 项，另有 1 个文件级导入错误。

- `tests/assembly/CodePluginInstaller.test.ts`：方式 A 装入默认插件集合（期望 `box-type-label` 与 `modified-star` 两个装饰器）
- `tests/e2e/Cli.test.ts`：默认装配下 tree 带 `*`；方式 A 与方式 B 对同一会话输出一致
- `tests/e2e/Phase2Acceptance.test.ts`：§5 modified-star 的 init/编辑/undo 状态；保存后 undo 回保存点；`(box) *` 并存；§6 三个会话与 `plugins-session` 双装配逐字节一致
- `tests/integration/TreeLabelsTogether.test.ts`：文件级导入错误（`@/_plugin/tree/ModifiedStarDecorator`）
- `tests/protocol/ExtensionPointHierarchy.test.ts`：文件级导入错误（`@/_plugin/tree/ModifiedStarDecorator`）

## 加回提交的结果

四个 `install-plugin-*` 提交的 `npm test` 均为全绿，`lint`、`verify:dual-assembly`、`e2e` 均通过。

| 标签 | npm test | 与基线 `5d0b570` 的差异 |
|---|---|---|
| `install-plugin-stats` | 213 / 213 | 0 行 |
| `install-plugin-dir` | 213 / 213 | 0 行 |
| `install-plugin-box` | 213 / 213 | 0 行 |
| `install-plugin-modified-star` | 213 / 213 | 0 行 |

## git diff 验证

命令形式：

```bash
# 删除提交的清单（只应涉及该插件、装配入口与配置）
git diff --name-status delete-plugin-<名>^ delete-plugin-<名>
# 加回提交的清单（应与删除提交互为镜像）
git diff --name-status install-plugin-<名>^ install-plugin-<名>
# 往返一致：删除前与加回后的树完全相同
git diff delete-plugin-<名>^ install-plugin-<名>
# 与基线一致
git diff 5d0b570 install-plugin-<名>
# 内核与其他插件未被触碰
git diff --name-only delete-plugin-<名>^ install-plugin-<名> -- src/protocol src/core src/cli src/_builtin src/host src/main.ts
```

结果：

- 四对提交的清单都只包含：该插件目录（`src/_plugin/...`）、该插件的测试目录、`src/assembly/CodePluginInstaller.ts`、`plugins.config.json`。删除提交为 `D`/`M`，加回提交为 `A`/`M`，互为镜像。
- 四对的往返差异均为 0 行；四个加回标签与基线 `5d0b570` 的差异均为 0 行。
- 内核目录（`src/protocol`、`src/core`、`src/cli`、`src/_builtin`、`src/host`、`src/main.ts`）在八个提交中均未出现。
- 其他插件的目录在每对提交中均未出现。

## 注意事项

- 每对提交同时修改装配入口（方式 A）与配置（方式 B），因此这四对提交不能单独证明"方式 A 只改一个装配文件"或"方式 B 只改配置"。这两条判据由此前的演示分支 `demo/plugin-via-code` 与 `demo/plugin-via-config` 证明，见 `docs/facts/dual-assembly-proof.md`。
- 删除提交中的测试失败是有意保留的：被删插件的测试随插件删除，而引用它的共享测试与期望输出未改动，它们的失败即"删除插件的影响面"。
- 构建前每次都执行 `rm -rf dist`，避免被删插件的旧产物残留在 `dist/` 中影响结果。
