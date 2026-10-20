# Plan3：将 Command 重构为面向对象的命令类层次

## 摘要

- 修正“数据联合类型 + `switch` 构造普通对象”的 TS 数据建模方式，建立可执行命令类层次。
- `Command` 与 `UndoableCommand` 作为抽象类；具体命令改为 class，内部封装参数并通过多态执行。
- CLI 解析器直接实例化命令对象，`Executor` 作为 Invoker 调用 `command.execute(context)`。
- 本轮只完成结构重构，不实现真实 Editor；使用 Demo Context 验证 Command → Receiver 链路。

## 公共接口

- `Command` 抽象类定义 `type` 与 `execute(context)`；`UndoableCommand` 继承它并提供 `undo(context)` 签名。
- `CommandContext` 聚合 `init/read/save/canvas/createShape/deleteShape/moveShape/scaleShape/setAttribute/groupShapes/ungroupShapes/addToContainer/reorderShape/tree/show/help/undo/redo`。
- `shape/EditableAttribute` 继续作为命令参数；`CommandResult` 结构保持不变。
- `CommandErrorCode` 新增 `command-not-implemented`，用于标记尚未实现的逆操作。
- 普通命令继承 `Command`；编辑命令继承 `UndoableCommand`。
- 具体命令封装私有参数，`execute` 只委托给对应 Context 方法；`ExitCommand` 直接返回 `exit`。
- `CommandLineParser` 直接 `new` 具体命令类，保留命令名 `switch` 作为唯一命令分发点。

## 接线与验证

- `DemoExecutor` 持有 `CommandContext`，通过 `command.execute(context)` 执行命令。
- `DemoCommandContext` 实现全部接收者方法并返回临时成功消息；`main.ts` 完成注入。
- Parser 测试改为验证具体类型、Context 方法名和参数。
- 命令层次测试验证编辑命令继承 `UndoableCommand`，其他命令不继承，并验证占位 undo 的错误码。
- 运行 `npm test`、`npm run build`，并复跑 `init 800 600`、`help`、`exit` 管道冒烟测试。

## 假设

- `src/protocol` 从纯 DTO 层调整为共享命令 API 层，不再坚持 Command 可直接跨进程 JSON 传输。
- 真实 Editor、文档状态和命令逆操作实现留到后续阶段。
- `box`、图形对象多态化和 SVG IO 不在本次重构范围内。
