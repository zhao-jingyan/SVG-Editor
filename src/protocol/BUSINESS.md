# Protocol：跨层交换契约

> Canonical owner：`src/protocol`

## 范围

- 本文档涵盖：命令如何从 CLI Parser 流转到 Core Executor / Receiver，编辑命令的撤销语义，以及跨层交换的图形、结果、错误和端口契约。
- 本文档不涵盖：命令文本如何解析（CLI owner）、图形自身的属性规则（`shapes` owner）或 Core 的文档生命周期与业务编排。

## 核心规则

- `Command` 不是独立层或模块边界：它由 CLI Parser 构造，经 CLI Session 交给 Core Executor，再由 Executor 调用 `command.execute(receiver)` 进入 Core Receiver。
- Protocol 是这些跨层对象的共同定义：Command、Shape、CommandResult、ProtocolError，以及 Executor 和 Receiver 能力端口。CLI 与 Core 都依赖 Protocol，Protocol 不依赖二者。
- `Executor` 接收已经解析好的 `Command`，返回 `CommandResult`；它不接收原始文本，也不负责命令名解析。
- `CommandReceiver` 由文档、图形、显示、历史四个能力接口组合而成。能力拆分用于说明命令所需能力，但具体命令仍面对统一聚合接口。
- 文档、显示、历史、会话命令只执行一次，不属于撤销单元；九类编辑命令继承 `UndoableCommand`，一条命令对应一个 undo 单元。
- 编辑命令通过局部状态实现逆操作：`create` 删除新图形，`move` 反向位移，`scale` 使用倒数因子；删除、分组、解散、归属迁移和重排保存 `ShapePlacement`，属性修改保存 `ShapeAttributeSnapshot`。
- 分组即使包含多个成员，也整体作为一个 undo 单元；命令不能把自身 undo/redo 再加入历史。
- 命令结果有三种：成功、业务错误和退出。成功结果携带用户可见消息，错误结果携带 `ProtocolError`，退出结果只表达会话结束。
- `CommandSuccessResult.isSuccess()` 为真；错误结果和退出结果均为假。退出不是业务失败，调用方必须按类型区分。
- `ProtocolError` 是唯一的已建模运行时错误类，包含来源、错误码和消息。来源只区分解析、命令执行、Document 和 Shape。
- 跨边界前必须把错误和结果转换为普通 DTO；DTO 只包含可序列化字段，不携带 `Error`、Command 或图形对象。
- CLI 只向用户显示错误消息和统一前缀，不显示错误码；错误码用于稳定分类和测试。
- `CommandExecutor` 捕获 `ProtocolError` 并转换为错误结果；未建模异常继续上抛，不能被伪装成普通命令失败。
- 命令成功后才记录历史；失败命令不产生副作用，也不改变历史栈或历史锁。
- Protocol 不依赖 `cli`、`core`、Node 或 DOM，可被未来 GUI、IPC 或其他执行入口复用。

## 状态与生命周期

- Command、Shape、Receiver 和 Error 都是进程内运行时对象，不承诺直接序列化。
- 只有 `CommandResultDto` 和 `CommandErrorDto` 是边界数据；DTO 的生命周期在单次执行结果交付内。
- 可撤销命令在 `execute` 时捕获必要上下文，撤销时恢复局部状态；redo 通过再次执行同一个命令实例完成。
- 成功结果只表示命令执行成功，不代表自动进入历史栈；是否记录由 Core 判断命令是否可撤销。

## 特殊判断与禁止事项

- `CommandExitResult` 虽然 `isSuccess()` 为假，但不得当作错误输出。
- 不得为每个错误码创建新的错误子类；来源枚举和错误码已经表达分类。
- 不得把完整文档、图形树或 `ProtocolError` 直接放入 DTO。
- 不得把 Command 描述为独立业务层，也不得让命令直接持有整份文档、历史栈或文件路径。
- 不得在 Protocol 内读取文件、终端或运行时环境。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| 解析与执行通过 Command 对象交换 | CLI 只生产命令，Core 只消费命令，双方共享 Protocol 契约而不互相依赖 | [Command](commands/Command.ts)、[Executor](execution/Executor.ts)、[CommandExecutor](../core/CommandExecutor.ts) |
| Receiver 按四类能力拆分再聚合 | 各命令只需要明确能力，聚合接口仍可统一执行 | commit `b06d06b`、[receivers](receivers/) |
| 局部 Memento 而非整文档快照 | 每个编辑命令表达真实逆操作，失败和恢复边界更清晰 | [ShapePlacement](commands/memento/ShapePlacement.ts)、[ShapeAttributeSnapshot](commands/memento/ShapeAttributeSnapshot.ts) |
| 结果与错误使用运行时类层次并转换 DTO | 内部保留行为对象，边界保持可序列化 | commits `73db7e1`、`e6d451d`；[results](results/)、[errors](errors/) |

## 相关代码

- 执行端口：[Executor](execution/Executor.ts)。
- 命令流：[Command](commands/Command.ts)、[UndoableCommand](commands/UndoableCommand.ts)、具体命令族 [commands](commands/)。
- Receiver 契约：[CommandReceiver](receivers/CommandReceiver.ts) 及四个能力接口。
- 结果：[CommandResult](results/CommandResult.ts)、[outcomes](results/outcomes/)、[CommandResultDto](results/dto/CommandResultDto.ts)。
- 错误：[ProtocolError](errors/ProtocolError.ts)、[CommandErrorCode](errors/CommandErrorCode.ts)、[ErrorSource](errors/ErrorSource.ts)、[CommandErrorDto](errors/dto/CommandErrorDto.ts)。
- 业务回归：[CommandHierarchy.test.ts](../../tests/protocol/CommandHierarchy.test.ts)、[CommandResults.test.ts](../../tests/protocol/CommandResults.test.ts)、[ProtocolErrors.test.ts](../../tests/protocol/ProtocolErrors.test.ts)、[EditorCommandReceiver.test.ts](../../tests/core/receiver/EditorCommandReceiver.test.ts)。
