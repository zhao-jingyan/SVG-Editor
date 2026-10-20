# Plan10：真实 EditorContext 与编辑撤销闭环

## 摘要

- 将 CLI 从 Demo 链路切换到 `Document` + `CommandHistory` 的真实编辑链路。
- 为九类图形编辑命令实现命令内局部状态捕获和逆操作，不使用整文档快照。
- SVG IO 与 `tree/show/help` 留到后续计划，本轮保持稳定的占位错误。

## 核心接线

- 新增 `EditorContext implements CommandContext`，私有持有可选 Document、CommandHistory 和历史锁。
- 新增 `CommandExecutor implements Executor`，委托 `EditorContext.execute`，并把 `ProtocolError` 转成 `CommandErrorResult`。
- `init` 创建默认 `800x600` 文档、清空历史并锁定；`canvas` 修改尺寸只锁定历史；成功编辑重新解锁。
- `main.ts` 使用真实 Context 与 Executor；删除 DemoContext、DemoExecutor 及对应测试。

## 文档恢复与撤销

- 新增 `ShapePlacement`、`ShapeAttributeSnapshot`，并在 `CommandContext` 暴露捕获/恢复方法。
- Document 与 ShapeHierarchy 增加精确索引插入、跨父级恢复、容器恢复和属性快照恢复。
- `restorePlacements` 对未注册图形注册子树，对已注册图形摘下后重插；多 placement 按父节点和索引升序恢复。
- `restoreGroup` 只接受非根级 GroupShape placement，先校验直接子节点仍位于原父级，再恢复容器和索引。
- `Shape.unsetAttribute` 支持清除公共样式；属性快照只捕获叶子，避免容器 undo 覆盖子节点不同旧值。

## 命令行为

- `CreateCommand` 删除创建子树；`DeleteCommand` 恢复精确位置；`MoveCommand` / `ScaleCommand` 使用逆操作。
- `GroupCommand` 恢复全部成员后删除空容器；`UngroupCommand` 恢复原容器。
- `AddToCommand` 与 `ReorderCommand` 恢复原父级和索引；`SetCommand` 按叶子恢复旧属性。
- 状态型命令在未执行前 undo 返回 `InvalidArgument`，消息为 `command has not been executed: <type>`。
- `read/save/tree/show/help` 返回 `CommandNotImplemented`，消息为 `<command> is not implemented yet`。

## 测试与验证

- Document 覆盖指定索引、跨父级、同父级、group/ungroup、零/单子节点容器、非法索引和失败原子性。
- EditorContext 覆盖九类命令 undo/redo、历史锁、无文档、失败不入栈、错误转换和真实 Repl 链路。
- Shapes 覆盖 `unsetAttribute` 的叶子、容器和非法属性分支。
- 验证命令为 `npm test`、`npm run build` 和编辑命令 CLI 管道冒烟。

## 假设

- 不新增错误码；恢复失败复用现有 Document 错误码。
- `canvas` 修改只锁定历史，不清空历史；`init` 替换文档时清空历史。
- IO 和显示格式化在后续计划实现，本轮只为它们保留稳定占位边界。
