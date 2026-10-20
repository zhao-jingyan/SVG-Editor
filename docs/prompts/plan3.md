# 第三轮 Prompt 与关键决策

## 用户需求

我指出重构的方向，这要作为 Plan3。当前写法完全是 TS 数据建模，缺乏面向对象美感。`Command` 应当作为接口或抽象类，具体 Command 去 implement 或 extend，这应在 Lab 说明中有明确依据，请审查并制定重构计划。

## 审查结论

- Lab 说明没有逐字写“`Command` 必须是 interface/abstract class”。
- 但 2.1 实现范式明确要求：TypeScript + 面向对象、类层次 + 多态、字段封装、禁止贫血模型、禁止过程式自由函数和到处 `switch(tag)` 分派。
- 重构前 `Command` 是可辨识联合类型，具体命令只是数据接口；这只能算请求 DTO，不足以单独作为 Command 模式的落地。
- 因此 Plan3 将可执行命令类层次作为主模型，而不是继续把 DTO 命名为 `Command`。

## 讨论结论

1. `Command` 抽象类、`UndoableCommand` 和具体命令类放在 `src/protocol`，作为 CLI 与 Core 共享的命令 API。
2. 本轮只做结构重构，不实现真实 Editor、文档状态或完整逆操作。
3. 采用两级抽象：`Command` 定义 `execute`，`UndoableCommand` 增加 `undo`；历史栈未来只接收 `UndoableCommand`。
4. 使用单一 `CommandContext` 接收者接口，聚合文档、图形、查询和历史操作。
5. 具体命令封装私有参数，`execute` 只委托给 `CommandContext` 的对应方法。
6. CLI 解析器直接实例化具体命令类，保留命令名 `switch` 作为 Lab 允许的命令分发点。
7. 本轮 `UndoableCommand.undo` 统一返回 `command-not-implemented`，真实逆操作等 EditorContext 落地后实现。
8. 新增 `DemoCommandContext` 和 `Command.execute` 调用，验证 Command → Receiver 多态链路。

## 最终计划

见 `docs/plans/plan3.md`。
