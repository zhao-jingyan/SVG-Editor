# CommandHistory 历史栈事实

## 角色与职责

- `CommandHistory` 位于 `src/core/history`，是 Command 模式中的 Caretaker，只保存 `UndoableCommand` 对象引用。
- 历史栈不保存图形、文档快照或命令结果；撤销状态由具体命令自行负责。
- `CommandHistory` 不决定命令是否执行成功，调用方只应在成功后调用 `record`。
- `CommandExecutor.execute` 是唯一记录点：编辑命令执行成功后入栈，`CommandHistory` 已接入真实执行链路。

## 公共行为

- `record` 把命令压入 undo 栈，并立即清空 redo 栈。
- `undo` 先窥视 undo 栈顶并调用 `command.undo(receiver)`；只有 `CommandResult.isSuccess()` 为真时才弹栈并压入 redo 栈。
- `redo` 先窥视 redo 栈顶并重新调用 `command.execute(receiver)`；只有成功时才弹栈并压回 undo 栈。
- 失败结果和异常都不会改变两个栈，避免一次失败导致命令丢失。
- 空历史返回 `CommandErrorResult`，其中错误为 `ErrorSource.CommandExecution` 来源的 `ProtocolError(HistoryUnavailable, ...)`。
- `clear` 同时清空 undo 与 redo 栈。
- `EditorContext` 在 `init` 后清空历史并锁定 undo/redo；`canvas` 修改尺寸只锁定历史；下一次成功编辑重新解锁。
- 历史锁定时 undo/redo 返回 `HistoryUnavailable`，消息为 `undo not allowed after io command`。

## 设计取舍

- 采用“先执行、成功后再弹栈”：如果先弹出再执行，命令失败后会从历史中消失，无法重试。
- redo 直接重新执行同一命令对象，而不是保存第二份命令或文档快照；具体命令必须保证 undo 后再次 execute 可恢复原效果。
- 历史锁定和文档类命令清栈由 `EditorContext` 负责，成功命令的入栈决策由 `CommandExecutor` 负责，`CommandHistory` 保持纯粹的 Caretaker 语义。
