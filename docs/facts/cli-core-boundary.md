# CLI、Protocol 与 Core 边界事实

## 目录职责

- `src/protocol` 存放 CLI 与 Core 共享的命令 API、图形领域模型、结果模型和错误模型：`Command`/`UndoableCommand` 抽象类、具体命令类、`CommandContext` 接收者接口、`Shape` 类层次、`ShapeFactory`、`results` 和 `errors` 子系统。该目录不得依赖 `src/cli`、`src/core`、Node 或 DOM。
- `src/cli` 存放用户界面适配代码：REPL 控制循环、输入读取、输出写入，以及把 CLI 文本解析为具体 `Command` 对象的 `CommandLineParser`。
- `src/core` 存放应用入口端口 `Executor`、真实 `CommandExecutor`、`EditorContext`、`CommandHistory`、`document` 和 `display` 子系统。`EditorContext` 实现命令接收者并持有当前文档与历史栈；`Document` 是聚合根门面，`ShapeHierarchy` 与 `ShapeIndex` 是内部协作对象；`display` 提供 tree/show/help 的格式化对象。SVG IO 尚未实现。
- `src/main.ts` 是组合根，只负责组装 CLI 适配器、解析器、Executor 与 CommandContext。
- `tests/cli` 存放 CLI、解析器和真实编辑链路测试，`tests/core` 存放 EditorContext、Executor 与 History 测试，`tests/core/document` 存放 Document、恢复能力和 ShapeIndex 测试，`tests/core/display` 存放摘要、明细和树形格式测试，`tests/protocol` 存放命令类层次与图形测试。

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

- `UndoableCommand` 继承 `Command`，提供 `undo(context)`；九类图形编辑命令均已覆盖逆操作，基类默认实现仍作为未覆盖子类的安全兜底。
- 文档、显示、历史和会话命令继承 `Command`；图形编辑命令继承 `UndoableCommand`。
- 具体命令封装私有参数，`execute` 通过多态委托给 `CommandContext`，不再由 Executor 根据 `type` 分派。
- `CommandLineParser` 直接实例化具体命令类；命令名 `switch` 是 Lab 允许的命令分发点。
- `CommandContext` 是命令接收者接口，编辑方法统一返回 `Promise<CommandResult>`；另提供位置、子树和属性快照的同步捕获/恢复方法，供命令保存局部撤销状态。

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
- 拒绝方案：让结果 DTO 直接持有 `Error` 实例会破坏边界可序列化性；为每个错误码建立独立类会产生大量只有消息差异的类型。`CommandExecutor` 在真实执行边界捕获 `ProtocolError` 并转换为 `CommandErrorResult`，未知异常继续上抛。

## 图形模型

- `Shape` 是抽象根类，具体类为 `RectShape`、`CircleShape`、`EllipseShape`、`LineShape`、`TextShape`、`GroupShape`。
- `GroupShape` 使用 Composite 语义，`move`、`scale` 和公共样式 `set` 递归作用于子节点。
- `ShapeFactory` 是唯一的“图形类型名 → 具体类”分派点；Parser 不直接构造领域对象。
- `ShapeVisitor` 是图形显示扩展点：`Shape.accept` 由各具体类分派到 Visitor，`ShapeSummaryVisitor` 和 `ShapeDetailVisitor` 位于 Core 的 `display` 子系统。
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
- `Repl` 接受可选启动提示；组合根传入 `svg-editor 0.1 — type 'help' for commands`，UI 文案不进入命令解析器。
- `CommandLineParser` 依赖协议层的具体命令类，不依赖 Core。
- `CommandExecutor` 位于 Core，实现 `Executor`，委托 `EditorContext.execute`，只依赖协议层 `Command`、`ProtocolError` 和结果类层次。
- `EditorContext` 位于 Core，实现 `CommandContext`，持有可选 `Document`、`CommandHistory` 和历史锁；成功执行编辑命令后记录历史并解除锁定。
- `CommandHistory` 由 `EditorContext` 持有，是真正的 Caretaker；undo/redo 命令通过 Context 委托历史栈。
- `Document` 位于 `src/core/document`，是图形文档的聚合根门面；`ShapeHierarchy` 负责结构编辑，`ShapeIndex` 负责身份、父子索引和祖先判断。

## 当前执行链路

```text
ConsoleInputReader -> Repl -> CommandLineParser -> 具体 Command
                                                        |
                                                        v
CommandExecutor -> EditorContext.execute -> command.execute(EditorContext)
                                                        |
                                                        v
                                      Document / CommandHistory / Shape 多态行为
```

- 空行和首个非空字符为 `#` 的注释行不创建命令。
- 解析错误输出 `error: <message>` 后继续循环。
- `success` 输出其 `message`，`error` 输出 `error: <message>`，`exit` 结束循环。
- 解析和命令执行结果在边界上转换为 `CommandParseResultDto` / `CommandResultDto`；运行时结果对象和错误对象不会直接进入输出层。
- `ExitCommand.execute` 不调用 Context，直接返回退出结果。
- `ConsoleInputReader` 使用常驻事件监听和内部队列，能够处理管道一次写入的多行输入。
- 编辑命令成功后进入历史栈；`init` 清空历史并锁定 undo/redo，`canvas` 修改尺寸只锁定历史，下一次成功编辑重新解禁。
- 未初始化文档时执行编辑、显示、撤销或画布命令返回 `no document. use 'init' or 'read' first`。
- `help` 不依赖文档；`tree` 与 `show` 使用真实 Document 数据输出显示结果，但不进入历史栈。

## 后续设计事实

- `EditorContext` 已接入 CLI 编辑链路，命令类本身保持与文档存储细节解耦。
- undo/redo 采用命令自身逆操作和局部状态，不使用整文档快照。
- `read/save` 当前返回 `command-not-implemented`；SVG IO、自动补 id、插件注册表和 IO 后历史锁的完整语义进入后续阶段。
- `Document`、`ShapeHierarchy` 与 `ShapeIndex` 已支持精确位置恢复和属性快照恢复，为命令撤销提供基础能力。
- 真实 Core 的 Document、IO、History 错误在实现时继承 `ProtocolError`，并继续通过 `CommandErrorDto` 返回。
