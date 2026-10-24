# 拆分命令执行与编辑会话职责

## 目标

- 将命令调用、成功判定和历史入栈决策从 `EditorContext` 移到 `CommandExecutor`。
- 消除 `EditorContext.execute(command)` 反向调用 `command.execute(EditorContext)` 的角色混杂。
- 保留唯一历史栈，不引入重复的 Caretaker 或整文档快照。

## 调整

- `CommandExecutor` 直接执行 `Command`，成功时记录 `UndoableCommand`。
- `EditorContext` 改为提供 `recordSuccessfulCommand`，只负责更新历史状态。
- `ProtocolError` 仍由 `CommandExecutor` 转换为 `CommandErrorResult`。
- undo/redo 和历史锁行为保持不变。

## 约束

- 不改变命令执行结果、历史顺序、失败回滚或输入输出行为。
- `EditorContext` 继续实现 `CommandReceiver`，`EditorContext` 重命名留到下一项独立调整。

## 验证

- 运行 `npm test` 与 `npm run build`。
