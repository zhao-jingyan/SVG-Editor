# Plan7：独立 CommandHistory 历史栈

## 摘要

- 在 `src/core/history` 新增 `CommandHistory`，先独立实现并测试历史栈语义，不接入 Demo 执行链路。
- 历史栈只保存 `UndoableCommand`；undo/redo 失败时两个栈保持原样。
- 为 `CommandResult` 增加成功判定能力，避免 Core 通过 DTO 或具体结果类判断执行结果。

## 公共接口

- `CommandResult` 新增抽象方法 `isSuccess(): boolean`：成功结果为 `true`，错误和退出结果为 `false`。
- `CommandHistory` 提供 `record`、`undo`、`redo`、`clear`、`canUndo`、`canRedo`。
- `record` 把命令压入 undo 栈并清空 redo 栈；调用方只应在命令执行成功后调用。
- `undo` 调用栈顶命令的 `undo`，仅在成功时把它移入 redo 栈。
- `redo` 重新调用栈顶命令的 `execute`，仅在成功时把它移回 undo 栈。
- 空历史使用 `CommandErrorCode.HistoryUnavailable`，消息为 `no command to undo` 或 `no command to redo`。

## 实现与测试

- `CommandHistory` 私有维护两个命令栈，不暴露底层数组。
- 新增 `ScriptedUndoableCommand` 测试支持类，可配置执行结果、撤销结果、调用次数和异常。
- 覆盖成功 undo/redo、LIFO、redo 清空、失败不弹栈、异常不弹栈、非成功结果、空历史和 `clear`。
- 更新结果类测试，验证 `isSuccess()` 与既有 DTO 转换互不影响。
- 更新 `docs/facts/cli-core-boundary.md`，新增 `docs/facts/command-history.md`。

## 假设

- 本轮不修改 `UndoableCommand` 默认实现、`CommandContext`、Demo 执行器、Demo 接收者或 `main.ts`。
- 具体命令在 undo 后再次 execute 应能正确 redo；历史栈保存命令对象引用，不做克隆。
- IO 后的历史锁定、init/read 清栈和真实执行器接入留到 EditorContext 阶段。
- 验证命令为 `npm test` 和 `npm run build`。
