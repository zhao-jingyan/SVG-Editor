# 第二轮 Prompt 与关键决策

## 用户需求

我们继续干这个活吧，我们把最重要的 command 模式尝试建立起来。我们会发现前端（CLI / 将来的 GUI）和后端（core，执行层）之间是一种通信的关系，这个通信就是利用 command 模式完成的。我们尝试写出 `src/protocol`。要求先列出计划；prompt 和 plan 最后要落库。先讨论一个设计模式正确、架构合理的方案，然后再执行。

## 讨论结论

1. 本轮只做“协议 + 解析”骨架：建立完整协议词表、CLI 解析器、强类型入口和临时回执，不实现 Editor、命令分发器、文档状态或 undo 栈。
2. Command 模式采用“可序列化 DTO + Core 命令对象”方案。`src/protocol` 只保存纯数据契约；后续 Core 将 DTO 物化为带 `execute(context)` / `undo(context)` 的命令对象。
3. 协议一次覆盖阶段文档中的完整命令词表，避免后续因命令接口反复改动。
4. `Executor` 入口改为接收强类型 `Command`；CLI 通过解析器把文本转换为 `Command`，未来 GUI 可以直接构造同一协议对象。
5. `CommandResult` 本轮采用“成功消息 + 结构化错误码 + exit”粒度，不提前定义逐命令结构化结果。
6. undo/redo 后续采用命令逆操作，而不是文档快照；历史栈保存已执行命令对象。
7. 文本语法属于 CLI 适配器，解析器放在 `src/cli`，`src/protocol` 不依赖 Node、DOM、CLI 或 Core。
8. 为验证通信链路，本轮把 `Repl → CommandParser → Executor` 接通；`DemoExecutor` 只返回临时回执。

## 最终计划

见 `docs/plans/plan2.md`。
