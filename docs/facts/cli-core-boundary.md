# CLI、Protocol 与 Core 边界事实

## 目录职责

- `src/protocol` 存放 CLI 与 Core 共享的命令 API、图形领域模型、结果模型和错误模型：`commands` 根目录持有 `Command` / `UndoableCommand` 基类、`CommandType` 和按语义族组织的具体命令；Protocol 根持有 `CommandReceiver` 接收者接口、`Executor` 入口端口、`Shape` 类层次、`ShapeFactory`、`results` 和 `errors` 子系统。该目录不得依赖 `src/cli`、`src/core`、Node 或 DOM。
- `src/cli/io` 存放交互端口与终端适配器：`InputReader` / `OutputWriter` 定义端口，`ConsoleInputReader` / `ConsoleOutputWriter` 只负责标准输入输出。
- `src/cli/parser` 根目录只保留 `CommandParser` 接口和 `CommandLineParser` 入口；`tokenization`、`arguments`、`commands`、`definition`、`results` 分别承载切词、参数校验、命令构造、命令注册和解析结果。
- `src/cli/session` 存放交互编排：`CommandLoop` 负责提示符、读取和终止，`CommandSession` 负责单次输入的反馈与继续/退出策略。
- `src/protocol` 还存放应用入口端口 `Executor`；`src/core` 存放真实 `CommandExecutor`、`EditorSession`、`CommandHistory`、`document`、`display` 和 `io` 子系统。`EditorSession` 实现命令接收者并持有当前文档，与执行器共享历史栈；`Document` 是聚合根门面，`ShapeHierarchy` 与 `ShapeIndex` 是内部协作对象；`display` 提供 tree/show/help 的格式化对象；`io` 提供 SVG 文件适配、解析和序列化。
- `src/main.ts` 是组合根，只负责组装 CLI 适配器、解析器、Executor 与 CommandReceiver。
- `tests/cli/parser` 和 `tests/cli/session` 分别镜像对应 CLI 子模块；`tests/core` 存放 EditorSession、Executor 与 History 测试，`tests/core/document` 存放 Document、恢复能力和 ShapeIndex 测试，`tests/core/display` 存放摘要、明细和树形格式测试，`tests/core/io` 存放 SVG 解析、写出和 round-trip 测试，`tests/protocol` 存放命令类层次与图形测试。

```text
src/cli
├── io
│   ├── ConsoleInputReader.ts
│   ├── ConsoleOutputWriter.ts
│   ├── InputReader.ts
│   └── OutputWriter.ts
├── parser
│   ├── CommandLineParser.ts
│   ├── CommandParser.ts
│   ├── commands
│   │   ├── definition
│   │   │   ├── CommandDefinition.ts
│   │   │   └── CommandDefinitionRegistry.ts
│   │   └── CommandsParser
│   │       ├── doc
│   │       │   └── DocumentCommandParser.ts
│   │       ├── shape
│   │       │   ├── CreateCommandParser.ts
│   │       │   └── ShapeCommandParser.ts
│   │       └── view
│   │           └── ViewCommandParser.ts
│   ├── results
│   │   ├── CommandParseEmptyResult.ts
│   │   ├── CommandParseErrorResult.ts
│   │   ├── CommandParseResult.ts
│   │   └── CommandParseSuccessResult.ts
│   └── syntax
│       ├── CommandArguments.ts
│       └── CommandLineTokenizer.ts
└── session
    ├── CommandLoop.ts
    ├── CommandSession.ts
    └── CommandSessionStatus.ts
```

## 文件命名

- TypeScript 文件默认使用 `PascalCase`，并与主要类、接口或类型同名。
- 每个主要类、接口和枚举单独成文件；具体命令按 `doc`、`shape`、`view`、`history`、`session` 语义族放在 `protocol/commands`，命令撤销快照放在 `protocol/commands/memento`；图形模型和值对象放在 `protocol/shapes/model`，具体图形放在 `concrete`，工厂与 Visitor 分别放在 `factory`、`visitor`；结果基类留在 `protocol/results` 根目录，具体结果放在 `outcomes`、结果 DTO 放在 `dto`；错误码与基类留在 `protocol/errors` 根目录，命令错误、领域错误和错误 DTO 分别放在 `command`、`domain`、`dto` 子目录。
- 测试文件使用 `<Name>.test.ts` 命名。
- 注释使用中文；提交信息使用中文 Conventional Commit。

## Command 模式

`Command` 是可执行抽象类，而不是纯数据联合类型：

```typescript
export abstract class Command {
  public abstract readonly type: CommandType;
  public abstract execute(receiver: CommandReceiver): Promise<CommandResult>;
}
```

- `UndoableCommand` 继承 `Command`，提供 `undo(receiver)`；九类图形编辑命令均已覆盖逆操作，基类默认实现仍作为未覆盖子类的安全兜底。
- 文档、显示、历史和会话命令继承 `Command`；图形编辑命令继承 `UndoableCommand`。
- 具体命令封装私有参数，`execute` 通过多态委托给 `CommandReceiver`，不再由 Executor 根据 `type` 分派。
- `CommandDefinitionRegistry` 集中维护“命令名 → 命令定义”的唯一映射；`DocumentCommandParser`、`CreateCommandParser`、`ShapeCommandParser` 和 `ViewCommandParser` 只负责各自命令族的参数解释与对象构造。
- `CommandLineParser` 不直接创建命令，也不维护命令名分支；它只负责词法、注册表查找和解析结果包装。
- `CommandArguments` 统一处理元数、必填文本、数字转换和参数切片，解析器不再分散维护静态辅助函数。
- `CommandReceiver` 是命令接收者接口，编辑方法统一返回 `Promise<CommandResult>`；另提供位置、子树和属性快照的同步捕获/恢复方法，供命令保存局部撤销状态。

## 结果模型

- `CommandResult` 是根目录的抽象基类，定义 `isSuccess()` 和 `toCommandResultDto()`；具体结果为 `outcomes` 下的 `CommandSuccessResult`、`CommandErrorResult` 和 `CommandExitResult`。
- `CommandErrorResult` 持有 `ProtocolError` 运行时对象，在转换为 `CommandResultDto` 时才生成 `CommandErrorDto`。
- `CommandResultDto` 位于 `results/dto`，保持 `success/error/exit` 三种结构和既有字段名。
- CLI 解析结果同样采用类层次：`CommandParseResult` 抽象基类，具体为 `CommandParseSuccessResult`、`CommandParseEmptyResult` 和 `CommandParseErrorResult`。
- `CommandParseResultDto` 是 CLI 边界结果 DTO，与抽象基类放在同一文件，携带已解析的 `Command`，不承诺可持久化。
- `CommandSession` 在解析和命令执行边界调用 `toCommandParseResultDto()` / `toCommandResultDto()`，之后只消费 DTO 判别字段。

## 错误模型

- `ProtocolError` 是继承 `Error` 的唯一运行时错误类，封装私有 `ErrorSource` 与 `CommandErrorCode`，提供 `getSource()`、`getCode()` 和 `toCommandErrorDto()`。
- `ErrorSource` 以枚举区分 `command-parse`、`command-execution`、`document` 和 `shape` 来源，不再为每种来源建立没有差异化行为的错误子类。
- `CommandErrorCode` 是封闭枚举，字符串值与既有 CLI 错误码完全一致；枚举成员使用 PascalCase 命名。
- `CommandErrorDto` 是边界 DTO，只包含 `code` 和 `message`。结果对象可以持有 `ProtocolError`，但跨边界只暴露 `CommandErrorDto`，保证错误结果可序列化。
- 命令构造器和 Tokenizer 失败时创建 `command-parse` 来源的 `ProtocolError`；`ShapeFactory` 失败创建 `shape` 来源；`CommandLineParser.parse()` 顶层捕获 `ProtocolError` 并统一生成 `CommandParseErrorResult`。
- `CommandSession` 只输出 `error: <message>`，不暴露错误码；未知异常不属于已建模的协议错误，因此继续向上抛出。
- `main.ts` 是进程最外层边界：已知命令失败由结果模型表达；未知异常打印到标准错误、设置非零退出码并结束进程，不伪装成普通命令失败。
- 拒绝方案：让结果 DTO 直接持有 `Error` 实例会破坏边界可序列化性；为每个错误码建立独立类会产生大量只有消息差异的类型。`CommandExecutor` 在真实执行边界捕获 `ProtocolError` 并转换为 `CommandErrorResult`，未知异常继续上抛。

## 图形模型

- `Shape` 是抽象根类，具体类为 `RectShape`、`CircleShape`、`EllipseShape`、`LineShape`、`TextShape`、`GroupShape`。
- `GroupShape` 使用 Composite 语义，`move`、`scale` 和公共样式 `set` 递归作用于子节点。
- `ShapeFactory` 是唯一的“图形类型名 → 具体类”分派点；Parser 不直接构造领域对象。
- `ShapeVisitor` 是图形显示扩展点：`Shape.accept` 由各具体类分派到 Visitor，`ShapeSummaryVisitor` 和 `ShapeDetailVisitor` 位于 Core 的 `display` 子系统。
- SVG 解析通过 `ShapeFactory` 创建具体图形；写出通过 `SvgShapeWriter` Visitor 生成元素，不新增按图形类型分派的业务流程。
- `CreateCommand` 与 `CommandReceiver.createShape` 直接携带 `Shape`，不再使用 `ShapeSpec` 或图形 DTO。
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

- `CommandLoop` 依赖 `io` 的 `InputReader` / `OutputWriter` 端口和 `session` 内的 `CommandSession`，只负责提示符、逐行读取、会话状态和结束条件。
- `CommandSession` 依赖 `parser` 的 `CommandParser` 接口、Protocol 的 `Executor` 接口和 `io` 的 `OutputWriter`；它把空输入、解析错误、命令结果和退出结果解释为终端反馈及继续/退出状态。
- `CommandLoop` 接受可选启动提示；组合根传入 `svg-editor 0.1 — type 'help' for commands`，UI 文案不进入命令解析器。
- `CommandDefinitionRegistry` 依赖协议层的具体命令类和图形工厂；`CommandLineParser` 只依赖 Tokenizer、注册表和参数对象。`parser` 不依赖 `session` 或 `io`。
- `cli/io` 不依赖 `parser` 或 `session`；终端适配器只知道输入输出端口。
- `CommandExecutor` 位于 Core，实现 `Executor`，依赖 `CommandReceiver` 与 `CommandHistory`；调用命令成功时直接记录 `UndoableCommand`，并转换 `ProtocolError`。
- `EditorSession` 位于 Core，实现 `CommandReceiver`，持有可选 `Document`，并与执行器共享 `CommandHistory`；它不提供历史记录转发方法。
- `EditorSession` 通过 `SvgStorage` 接口访问文件；`FileSvgStorage` 是 Core 内唯一直接使用 Node `fs/promises` 的适配器，协议层不感知文件系统。
- `CommandHistory` 由组合根创建并同时注入执行器与 EditorSession，是真正的 Caretaker；命令栈和历史锁均由它维护。
- `Document` 位于 `src/core/document`，是图形文档的聚合根门面；`ShapeHierarchy` 负责结构编辑，`ShapeIndex` 负责身份、父子索引和祖先判断。

## 当前执行链路

```text
ConsoleInputReader -> CommandLoop -> CommandSession -> CommandLineParser -> 具体 Command
                                                               |
                                                               v
CommandExecutor -> command.execute(CommandReceiver) -> Document / Shape 多态行为
       |
       +-> CommandHistory.record
```

- Parser 把空行和首个非空字符为 `#` 的注释行识别为 `empty`，把语法或参数失败识别为 `error`。
- `CommandSession` 对 `empty` 不产生输出并继续会话，对 `error` 输出反馈并继续会话；这两类输入不会进入 Executor。
- 解析错误输出 `error: <message>` 后继续循环。
- `success` 输出其 `message`，`error` 输出 `error: <message>`，`exit` 结束循环。
- 解析和命令执行结果在边界上转换为 `CommandParseResultDto` / `CommandResultDto`；运行时结果对象和错误对象不会直接进入输出层。
- `ExitCommand.execute` 不调用命令接收者，直接返回退出结果。
- `ConsoleInputReader` 使用常驻事件监听和内部队列，能够处理管道一次写入的多行输入。
- 编辑命令成功后进入历史栈；`init` 清空历史并锁定 undo/redo，`canvas` 修改尺寸只锁定历史，下一次成功编辑重新解禁。
- `read` 成功替换文档、清空历史并锁定；`save` 成功只锁定历史，不主动清空历史；失败的 IO 操作不改变历史锁。
- 未初始化文档时执行编辑、显示、撤销或画布命令返回 `no document. use 'init' or 'read' first`。
- `help` 不依赖文档；`tree` 与 `show` 使用真实 Document 数据输出显示结果，但不进入历史栈。

## 后续设计事实

- `EditorSession` 已接入 CLI 编辑链路，命令类本身保持与文档存储细节解耦。
- undo/redo 采用命令自身逆操作和局部状态，不使用整文档快照。
- `read/save` 已接入 SVG 子集与 IO 历史锁；插件注册表、复杂 SVG 特性和无损保留未知元素进入后续阶段。
- `Document`、`ShapeHierarchy` 与 `ShapeIndex` 已支持精确位置恢复和属性快照恢复，为命令撤销提供基础能力。
- 真实 Core 的 Document、IO、History 错误在实现时继承 `ProtocolError`，并继续通过 `CommandErrorDto` 返回。
