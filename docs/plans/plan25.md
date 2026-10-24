# 由 CommandHistory 自维护历史状态

## 目标

- 移除 `EditorSession.recordSuccessfulCommand` 转发，避免 Receiver 知道命令入栈协议。
- 让 `CommandHistory` 自己管理命令栈与历史锁。
- 让 `CommandExecutor` 直接依赖抽象的 `CommandReceiver` 和共享的 `CommandHistory`。

## 调整

- `CommandExecutor` 同时持有 Receiver 与 History；成功执行 `UndoableCommand` 后直接调用 `history.record`。
- `EditorSession` 注入与执行器相同的 `CommandHistory`，不再保存历史锁或转发记录方法。
- `CommandHistory` 增加 `lock()`；`record` 在入栈时解除锁定，`undo`/`redo` 自行拒绝锁定状态。
- init/read/save/canvas 的锁定时机保持不变。

## 约束

- 不改变成功命令入栈、redo 清空、失败命令不入栈或历史错误消息。
- 同一编辑器会话必须共享同一个 `CommandHistory` 实例，由组合根负责显式注入。

## 验证

- 增加历史锁定与记录后解锁测试。
- 运行 `npm test` 与 `npm run build`。
