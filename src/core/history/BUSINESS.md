# undo / redo 历史栈与历史锁

> Canonical owner：`src/core/history`

## 范围

- 本文档涵盖：成功命令何时进入历史、undo/redo 栈转换、失败时栈的稳定性，以及 IO 后的历史锁。
- 本文档不涵盖：具体命令如何实现逆操作、当前文档是否存在、IO 本身是否成功或用户反馈文案。

## 核心规则

- 历史只保存 `UndoableCommand` 对象引用，不保存 Document、图形集合或整文档快照。
- 一条成功编辑命令对应一个 undo 单元；成功执行后由 `CommandExecutor` 调用 `record`。
- `record` 把命令压入 undo 栈，立即清空 redo 栈并解除历史锁。
- redo 栈非空时执行新编辑，旧 redo 分支不可再恢复。
- `undo` 先查看栈顶，命令撤销成功后才弹入 redo 栈；失败时两个栈保持不变。
- `redo` 再次执行同一命令实例，成功后才从 redo 栈移回 undo 栈；失败时两个栈保持不变。
- 空 undo/redo 返回 `history unavailable` 业务错误，不抛未建模异常。
- 历史锁期间 undo/redo 返回 `undo not allowed after io command`，直到下一次成功编辑触发 `record`。
- `init` 和 `read` 成功后清空两栈并加锁；`save` 和成功 resize 的 `canvas` 只加锁；失败 IO 不改变历史。
- `undo`、`redo`、显示命令、文档命令和 `exit` 不进入历史栈。

## 状态与生命周期

- 历史有两组互斥转移：成功 undo 将命令从 undo 栈移入 redo 栈；成功 redo 反向移动。
- 新编辑成功后 redo 栈清空，历史形成线性分支。
- 历史锁独立于栈内容；即使栈中仍有命令，锁定时也不能执行 undo/redo。
- 历史仅存在于当前进程和当前文档生命周期内，不持久化。

## 特殊判断与禁止事项

- 不能先弹栈再执行；失败命令必须保留在栈中以便重试。
- 不允许 History 自行选择 `UndoableCommand`；入栈决策属于 Executor。
- 不允许 Receiver 或命令直接修改栈数组。
- 未初始化文档时由 Receiver 先返回 no-document，不能把空历史误报为“没有可撤销命令”。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| 成功后再弹栈 | 防止逆操作失败导致命令从历史中永久丢失 | [CommandHistory](CommandHistory.ts)、[CommandHistory.test.ts](../../../tests/core/CommandHistory.test.ts) |
| 只保存命令引用 | 逆操作由命令自身承载，避免历史快照与文档状态竞争 | [CommandHistory](CommandHistory.ts) |
| 历史锁归 History 所有 | 锁定判定与栈状态在同一对象内保持一致 | commit `d4a2a51`、[EditorCommandReceiver.test.ts](../../../tests/core/receiver/EditorCommandReceiver.test.ts) |

## 相关代码

- 历史实现：[CommandHistory](CommandHistory.ts)。
- 唯一记录点：[CommandExecutor](../CommandExecutor.ts)。
- IO 生命周期触发：[EditorDocumentCommandReceiver](../receiver/EditorDocumentCommandReceiver.ts)。
- 业务回归：[CommandHistory.test.ts](../../../tests/core/CommandHistory.test.ts)、[EditorCommandReceiver.test.ts](../../../tests/core/receiver/EditorCommandReceiver.test.ts)。
