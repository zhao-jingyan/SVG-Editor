# 实现命令插件：`stats` 与 `dir`

## 前置

- plan36 已落地：`getRootShapes()` 与 `DirectoryListing` 契约可用。

## 目标

在 `src/plugin/commands/` 实现两个独立于 builtin 的命令插件，经同一 `CommandRegistry` 注册路径接入。

### `stats`

- 包路径：`plugin/commands/StatsCommand/`（`StatsCommand` + `StatsCommandContribution`）。
- `execute` 调用 `receiver.getRootShapes()`，插件内 DFS：叶子按类型首次出现顺序计数；普通 `g`（及后续 `box`）只计 containers；根 SVG 不计；输出形如 `rect: 3  circle: 1  text: 2  (total 6, containers 2)`；空画布 `(total 0, containers 0)`。
- 不入 undo；依赖 `protocol` 图形模型，不依赖 `builtin` / `core` 内部。

### `dir`

- 包路径：`plugin/commands/DirCommand/`（`DirCommand` + `DirCommandContribution` + Node `DirectoryListing` 适配器）。
- 构造注入 `DirectoryListing`；`execute` 忽略 Receiver；列举进程 cwd 直接子项（含隐藏项，不含 `.`/`..`）；`[DIR]` 在前、`[FILE]` 在后，各组名称升序；空目录 `(empty directory)`；失败 `error: cannot read directory: <path>`。
- Adapter：Target=`DirectoryListing`，Adaptee=Node `fs`；可用测试替身单测命令逻辑，再用临时目录测真实适配器。
- 无文档可用；不改文档 / dirty / cwd / undo。

## 装配

- 方式 A（本轮）：`main` 显式 `register` 两条贡献（dir 注入 Node 适配器）；测试夹具可按需注册，**不**并入 Phase 1 `createBuiltinCatalog`。
- 方式 B（配置加载）与完整插件生命周期不在本轮。

## 文档

- 更新扩展点/边界事实；`dir` 适配器角色写清；符号链接等特殊项显示约定一并说明。

## 验证

- `npm test`
- `npm run build`
- 覆盖：stats 计数与无文档；dir 替身 + 真实 FS、无文档可用、不碰 undo。

## 完成状态

- 已完成：`stats` / `dir` 落地，`main` 方式 A 注册；测试覆盖统计、替身与真实 FS。
