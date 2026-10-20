# CLI、Protocol 与 Core 边界事实

## 目录职责

- `src/protocol` 存放 CLI 与 Core 共享的命令 API、图形领域模型、结果模型和错误模型：`Command`/`UndoableCommand` 抽象类、具体命令类、`CommandContext` 接收者接口、`Shape` 类层次、`ShapeFactory`、`results` 和 `errors` 子系统。该目录不得依赖 `src/cli`、`src/core`、Node 或 DOM。
- `src/cli` 存放用户界面适配代码：REPL 控制循环、输入读取、输出写入，以及把 CLI 文本解析为具体 `Command` 对象的 `CommandLineParser`。
- `src/core` 存放应用入口端口 `Executor`、临时执行器、Demo 接收者、独立 `CommandHistory` 和 `document` 子系统。`Document` 是聚合根门面，`ShapeHierarchy` 与 `ShapeIndex` 是内部协作对象。当前没有真实 Editor 或 SVG IO，历史栈也尚未接入执行链路。
- `src/main.ts` 是组合根，只负责组装 CLI 适配器、解析器、Executor 与 CommandContext。
- `tests/cli` 存放 CLI 与解析器行为测试，`tests/core` 存放 Executor 与 History 测试，`tests/core/document` 存放 Document 和 ShapeIndex 测试，`tests/protocol` 存放命令类层次测试。

## 文件命名

- TypeScript 文件默认使用 `PascalCase`，并与主要类、接口或类型同名。
- 每个主要类、接口和枚举单独成文件；具体命令放在 `protocol/commands`，图形类与工厂放在 `protocol/shapes`，结果类放在 `protocol/results`，共享错误类型放在 `protocol/errors`。
- 测试文件使用 `<Name>.test.ts` 命名。
- 注释使用中文；提交信息使用中文 Conventional Commit。

## Command 模式

`Command` 是可执行抽象类，而不是纯数据联合类型：

```typescript
export abstract class Command {
  public abstract readonly type: CommandType;
  public abstract execute(context: CommandContext): Promise<CommandResult>;
}
```

- `UndoableCommand` 继承 `Command`，提供 `undo(context)`；当前全部具体逆操作返回 `command-not-implemented`。
- 文档、显示、历史和会话命令继承 `Command`；图形编辑命令继承 `UndoableCommand`。
- 具体命令封装私有参数，`execute` 通过多态委托给 `CommandContext`，不再由 Executor 根据 `type` 分派。
- `CommandLineParser` 直接实例化具体命令类；命令名 `switch` 是 Lab 允许的命令分发点。
- `CommandContext` 是命令接收者接口，统一返回 `Promise<CommandResult>`。

## 结果模型

- `CommandResult` 是抽象基类，定义 `isSuccess()` 和 `toCommandResultDto()`；具体结果为 `CommandSuccessResult`、`CommandErrorResult` 和 `CommandExitResult`。
- `CommandErrorResult` 持有 `ProtocolError` 运行时对象，在转换为 `CommandResultDto` 时才生成 `CommandErrorDto`。
- `CommandResultDto` 是协议层边界结果 DTO，保持 `success/error/exit` 三种结构和既有字段名。
- CLI 解析结果同样采用类层次：`CommandParseResult` 抽象基类，具体为 `CommandParseSuccessResult`、`CommandParseEmptyResult` 和 `CommandParseErrorResult`。
- `CommandParseResultDto` 是 CLI 边界结果 DTO，携带已解析的 `Command`，不承诺可持久化。
- `Repl` 在解析和命令执行边界调用 `toCommandParseResultDto()` / `toCommandResultDto()`，之后只消费 DTO 判别字段。

## 错误模型

- `ProtocolError` 是继承 `Error` 的抽象基类，封装私有 `CommandErrorCode`，提供 `getCode()` 和 `toCommandErrorDto()`；构造器负责建立错误码与消息不变量。
- 具体错误按来源分为 `CommandParseError`、`CommandExecutionError`、`ShapeError` 和 `DocumentError`，均位于 `src/protocol/errors` 并继承 `ProtocolError`。
- `CommandErrorCode` 是封闭枚举，字符串值与既有 CLI 错误码完全一致；枚举成员使用 PascalCase 命名。
- `CommandErrorDto` 是边界 DTO，只包含 `code` 和 `message`。结果对象可以持有 `ProtocolError`，但跨边界只暴露 `CommandErrorDto`，保证错误结果可序列化。
- `CommandLineParser` 内部失败抛出 `CommandParseError`；`ShapeFactory` 失败抛出 `ShapeError`；`parse()` 顶层捕获 `ProtocolError` 并统一生成 `CommandParseErrorResult`。
- `Repl` 只输出 `error: <message>`，不暴露错误码；未知异常不属于协议错误时继续向上抛出。
- 拒绝方案：让结果 DTO 直接持有 `Error` 实例会破坏边界可序列化性；为每个错误码建立独立类会产生大量只有消息差异的类型。`UndoableCommand.undo` 当前通过 `CommandErrorResult(CommandExecutionError)` 返回 `command-not-implemented`。

## 图形模型

- `Shape` 是抽象根类，具体类为 `RectShape`、`CircleShape`、`EllipseShape`、`LineShape`、`TextShape`、`GroupShape`。
- `GroupShape` 使用 Composite 语义，`move`、`scale` 和公共样式 `set` 递归作用于子节点。
- `ShapeFactory` 是唯一的“图形类型名 → 具体类”分派点；Parser 不直接构造领域对象。
- `CreateCommand` 与 `CommandContext.createShape` 直接携带 `Shape`，不再使用 `ShapeSpec` 或图形 DTO。
- 图形模型的设计模式角色、替代方案和当前边界见 `docs/facts/domain-shapes.md`。

## 依赖方向

```text
src/main.ts -> src/cli
src/main.ts -> src/core
src/cli -> src/protocol
src/core -> src/protocol
src/protocol -/-> src/cli
src/protocol -/-> src/core
src/core -/-> src/cli
```

- `Repl` 依赖 `CommandParser` 接口和 `Executor` 接口。
- `CommandLineParser` 依赖协议层的具体命令类，不依赖 Core。
- `DemoExecutor` 只依赖协议层 `Command`、`CommandContext` 和 `CommandResult` 类层次。
- `DemoCommandContext` 位于 Core，是 `CommandContext` 的临时实现。
- `CommandHistory` 位于 Core，是独立实现的 Caretaker；当前未被 `DemoExecutor` 或 `DemoCommandContext` 使用。
- `Document` 位于 `src/core/document`，是图形文档的聚合根门面；`ShapeHierarchy` 负责结构编辑，`ShapeIndex` 负责身份、父子索引和祖先判断。当前未被 Demo 执行链路使用。

## 当前执行链路

```text
ConsoleInputReader -> Repl -> CommandLineParser -> 具体 Command
                                                        |
                                                        v
DemoExecutor -> command.execute(context) -> DemoCommandContext
```

- 空行和首个非空字符为 `#` 的注释行不创建命令。
- 解析错误输出 `error: <message>` 后继续循环。
- `success` 输出其 `message`，`error` 输出 `error: <message>`，`exit` 结束循环。
- 解析和命令执行结果在边界上转换为 `CommandParseResultDto` / `CommandResultDto`；运行时结果对象和错误对象不会直接进入输出层。
- `ExitCommand.execute` 不调用 Context，直接返回退出结果。
- `ConsoleInputReader` 使用常驻事件监听和内部队列，能够处理管道一次写入的多行输入。

## 后续设计事实

- 真实 `EditorContext` 将实现 `CommandContext`，命令类本身保持与文档存储细节解耦。
- 编辑命令将覆盖 `UndoableCommand.undo`；`CommandHistory` 已实现，后续由真实 `EditorContext` 与执行器接入。
- undo/redo 采用命令自身逆操作，不使用文档快照。
- `Document` 已实现画布和公开编辑入口，`ShapeHierarchy` 与 `ShapeIndex` 已拆出图形归属、结构编辑和索引不变量；EditorContext、SVG 读写和插件注册表进入后续阶段。
- 真实 Core 的 Document、IO、History 错误在实现时继承 `ProtocolError`，并继续通过 `CommandErrorDto` 返回。
