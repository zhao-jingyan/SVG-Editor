# CLI、Protocol 与 Core 边界事实

## 目录职责

- `src/protocol` 存放 CLI 与 Core 共享的纯协议类型：命令 DTO、图形 DTO、执行结果和错误码。该目录不得依赖 `src/cli`、`src/core`、Node 或 DOM。
- `src/cli` 存放用户界面适配代码：REPL 控制循环、输入读取、输出写入，以及把 CLI 文本解析为协议命令的 `CommandLineParser`。
- `src/core` 存放应用入口端口 `Executor` 及其临时实现。本轮没有真实 Editor、命令分发器或历史栈。
- `src/main.ts` 是组合根和启动入口，只负责组装 CLI 适配器、解析器与 `Executor`，不实现业务逻辑。
- `tests/cli` 存放 CLI 与解析器行为测试，`tests/core` 存放 Executor 实现测试。

## 文件命名

- TypeScript 文件默认使用 `PascalCase`，并与主要类、接口或类型同名。
- 每个主要类、接口和联合类型单独成文件；协议命令与图形 DTO 分别放在 `protocol/commands`、`protocol/shapes`。
- 测试文件使用 `<Name>.test.ts` 命名。
- 注释使用中文；提交信息使用中文 Conventional Commit。

## 通信边界

CLI 与 Core 不再传递原始字符串，而是传递可序列化的强类型 `Command`：

```typescript
export interface Executor {
  execute(command: Command): Promise<CommandResult>;
}

export type CommandResult =
  | { readonly type: "success"; readonly message: string }
  | { readonly type: "error"; readonly error: CommandError }
  | { readonly type: "exit" };
```

- `Command` 是覆盖完整命令词表的可辨识联合，命令通过 `type` 字段区分。
- `CommandResult` 只提供成功消息、结构化错误和退出分支；逐命令结构化结果后续再扩展。
- CLI 文本语法由 `src/cli/CommandLineParser` 负责转换为协议命令，协议层不包含解析逻辑。
- 未来 GUI 可以直接构造 `Command` 并调用同一个 `Executor`，无需经过 CLI 文本语法。

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

- `Repl` 依赖 `CommandParser` 接口和 `Executor` 接口，不依赖具体解析器或 Demo 实现。
- `CommandLineParser` 只依赖协议类型，不依赖 Core。
- `src/core` 不得依赖 `src/cli`，因此未来 GUI 可以绕过 CLI 复用同一应用入口。
- 依赖真实终端的代码只能位于 CLI 适配器；测试使用假输入、输出、解析器和 Executor。

## 当前行为事实

- REPL 每轮显示 `svg> `，读取一行文本后交给 `CommandParser.parse`。
- 空行和首个非空字符为 `#` 的注释行不调用 Executor。
- 解析错误输出 `error: <message>` 后继续循环。
- `success` 输出其 `message`，`error` 输出 `error: <message>`，`exit` 结束循环。
- Executor 抛异常时，CLI 输出统一错误信息并继续循环。
- `DemoExecutor` 仅验证边界：`exit` 返回退出，其他命令返回 `received command: <type>`。
- `ConsoleInputReader` 使用常驻事件监听和内部队列，能够处理管道一次写入的多行输入。

## 后续设计事实

- 经典 Command 模式采用“协议 DTO + Core 命令对象”两层结构。
- 后续 Core 的 `EditorCommand` 暴露 `execute(context)` 与 `undo(context)`，历史栈保存已执行命令对象。
- undo/redo 采用命令自身逆操作，不使用文档快照。
- 真实命令分发、文档状态和 SVG 读写进入后续阶段，不回流到 `src/cli`。
