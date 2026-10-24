# CommandContext 重命名为 CommandReceiver

## 目标

- 用命令模式中的 Receiver 角色命名协议接口，避免 `Context` 被误解为共享状态或应用上下文。
- 让命令参数名与类型表达同一语义，提升调用链可读性。

## 调整范围

- `CommandContext` 重命名为 `CommandReceiver`，文件名同步改为 `CommandReceiver.ts`。
- 命令、撤销命令和历史栈中的 `context` 参数统一改名为 `receiver`。
- 测试替身 `RecordingCommandContext` 重命名为 `RecordingCommandReceiver`，记录类型 `ContextCall` 改为 `ReceiverCall`。
- `EditorContext` 类名暂时保留；本轮只修正 Receiver 端口命名，不调整其应用门面职责。

## 约束

- 不改变命令执行、撤销、历史记录或输入输出行为。
- 保持 `cli -> protocol`、`core -> protocol`、`main -> cli + core` 的依赖方向。
- 历史计划文档保留当时的类型名，不追溯改写；本轮计划记录命名变更。

## 验证

- 运行 `npm test` 与 `npm run build`。
