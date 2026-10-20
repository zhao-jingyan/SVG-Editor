# CLI、Protocol 与 Core 边界事实

## 目录职责

- `src/protocol` 存放 CLI 与 Core 共享的命令 API：`Command`/`UndoableCommand` 抽象类、具体命令类、`CommandContext` 接收者接口、图形参数 DTO、执行结果和错误码。该目录不得依赖 `src/cli`、`src/core`、Node 或 DOM。
- `src/cli` 存放用户界面适配代码：REPL 控制循环、输入读取、输出写入，以及把 CLI 文本解析为具体 `Command` 对象的 `CommandLineParser`。
- `src/core` 存放应用入口端口 `Executor`、临时执行器和 Demo 接收者。当前没有真实 Editor、文档状态或历史栈。
- `src/main.ts` 是组合根，只负责组装 CLI 适配器、解析器、Executor 与 CommandContext。
- `tests/cli` 存放 CLI 与解析器行为测试，`tests/core` 存放 Executor 测试，`tests/protocol` 存放命令类层次测试。

## 文件命名

- TypeScript 文件默认使用 `PascalCase`，并与主要类、接口或类型同名。
- 每个主要类、接口和联合类型单独成文件；具体命令放在 `protocol/commands`，图形参数放在 `protocol/shapes`。
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
- `DemoExecutor` 只依赖协议层 `Command`、`CommandContext` 和 `CommandResult`。
- `DemoCommandContext` 位于 Core，是 `CommandContext` 的临时实现。

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
- `ExitCommand.execute` 不调用 Context，直接返回退出结果。
- `ConsoleInputReader` 使用常驻事件监听和内部队列，能够处理管道一次写入的多行输入。

## 后续设计事实

- 真实 `EditorContext` 将实现 `CommandContext`，命令类本身保持与文档存储细节解耦。
- 编辑命令将覆盖 `UndoableCommand.undo`，历史栈只保存 `UndoableCommand` 实例。
- undo/redo 采用命令自身逆操作，不使用文档快照。
- 图形对象多态化、Composite 容器与 SVG 读写进入后续阶段。
