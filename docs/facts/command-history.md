# CommandHistory 历史栈事实

## 角色与职责

- `CommandHistory` 位于 `src/core/history`，是 Command 模式中的 Caretaker，只保存 `UndoableCommand` 对象引用。
- 历史栈不保存图形、文档快照或命令结果；撤销状态由具体命令自行负责。
- `CommandHistory` 不决定命令是否执行成功，调用方只应在成功后调用 `record`。
- 当前历史栈尚未接入 `Executor`、`EditorContext` 或 CLI，只作为后续编辑器的独立基础组件。

## 公共行为

- `record` 把命令压入 undo 栈，并立即清空 redo 栈。
- `undo` 先窥视 undo 栈顶并调用 `command.undo(context)`；只有 `CommandResult.isSuccess()` 为真时才弹栈并压入 redo 栈。
- `redo` 先窥视 redo 栈顶并重新调用 `command.execute(context)`；只有成功时才弹栈并压回 undo 栈。
- 失败结果和异常都不会改变两个栈，避免一次失败导致命令丢失。
- 空历史返回 `CommandErrorResult(CommandExecutionError(HistoryUnavailable, ...))`。
- `clear` 同时清空 undo 与 redo 栈。

## 设计取舍

- 采用“先执行、成功后再弹栈”：如果先弹出再执行，命令失败后会从历史中消失，无法重试。
- redo 直接重新执行同一命令对象，而不是保存第二份命令或文档快照；具体命令必须保证 undo 后再次 execute 可恢复原效果。
- IO 后的历史锁定、文档类命令清栈和真实执行器接线不在本组件内实现，避免在没有 EditorContext 时提前固化错误边界。
