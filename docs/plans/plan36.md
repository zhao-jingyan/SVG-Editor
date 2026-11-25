# 扩展系统能力：文档结构查询与目录列举端口

## 目标

为 Phase 2 命令插件 `stats` / `dir` 补齐协议侧系统能力，**本轮不实现命令本身**。

- `stats` 经 Receiver：在 `DocumentCommandReceiver` 增加通用只读查询 `getRootShapes()`，不新增 `stats()`。
- `dir` 不经 Receiver：在 `protocol` 增加独立文件系统端口 `DirectoryListing` / `DirectoryEntry`，供后续适配器实现。

## 边界

- `getRootShapes()`：无文档抛 `NoDocument`；有文档返回画布根下直接子节点（只读，顺序与文档一致）；空画布返回 `[]`。
- 不改文档、dirty、history、cwd。
- `DirectoryListing` 仅契约；Node 适配器与 `DirCommand` 留 plan37。
- `protocol` 仍不得依赖 `cli` / `core` / `builtin` / `plugin` / Node。

## 改动面

- Protocol：`DocumentCommandReceiver.getRootShapes()`；新建目录列举契约（建议 `protocol/io/` 或 `protocol/fs/`）。
- Core：`EditorDocumentCommandReceiver` / `EditorCommandReceiver` 委托 `Document.getRootShapes()`。
- 测试：`RecordingCommandReceiver` 与 Receiver 协作测试覆盖无文档 / 空画布 / 有子节点。
- 文档：`docs/facts/`、必要时 `AGENTS.md` 记清「命令专用 API 不上 Receiver；FS 用独立端口」。

## 验证

- `npm test`
- `npm run build`

## 完成状态

- 已完成：`getRootShapes()` 与 `DirectoryListing` / `DirectoryEntry` 契约落地；Core 委托与测试通过。
