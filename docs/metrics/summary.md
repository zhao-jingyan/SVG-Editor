# CLI Metrics（自动生成）

> 由 `npm run metrics`（`scripts/generate-metrics.mjs`）从 git 对象生成，不接受手填。
>
> 基线：`final` → 对比：`p2`
>
> 生成时间：2026-11-26T04:49:52.217Z

## 分类与口径

| 类别 | 路径 |
|---|---|
| 内核 | `src/protocol`、`src/core`、`src/cli`、`src/_builtin` |
| 装配处 | `src/main.ts`、`src/host`、`src/assembly` |
| 插件 | `src/_plugin` |
| VSCode 扩展 | `vscode-extension/`（单独列出，不计入 CLI 增量） |

- 圈复杂度由 TypeScript 编译器 API 解析 AST 得到：每个函数（含方法、构造器、箭头函数）为 1 + 判定点（`if`、`for`、`for-in`、`for-of`、`while`、`do`、`case`、`catch`、`?:`、`&&`、`||`、`??`）；嵌套函数单独计算；文件值为其内函数之和。
- 职责列取文件首个 JSDoc 注释的首行；没有注释时回退到目录职责表（来源列标明）。
- 行数含空行与注释；`node_modules` / `dist` 排除。

## final 快照

| 类别 | 文件数 | 行数 | 复杂度 |
|---|---:|---:|---:|
| 内核 | 94 | 4961 | 801 |
| 装配处 | 1 | 38 | 2 |
| 插件 | 0 | 0 | 0 |
| **CLI 合计** | 95 | 4999 | 803 |

## p2 快照

| 类别 | 文件数 | 行数 | 复杂度 |
|---|---:|---:|---:|
| 内核 | 135 | 6217 | 980 |
| 装配处 | 12 | 746 | 123 |
| 插件 | 18 | 665 | 111 |
| **CLI 合计** | 165 | 7628 | 1214 |

## 增量（p2 − final）

| 类别 | 文件数 Δ | 行数 Δ | 复杂度 Δ |
|---|---:|---:|---:|
| 内核 | 41 | 1256 | 179 |
| 装配处 | 11 | 708 | 121 |
| 插件 | 18 | 665 | 111 |
| **CLI 合计** | 70 | 2629 | 411 |
| VSCode 扩展（单独） | 15 | 1093 | 172 |

## 文件清单与职责（p2）

### 内核

| 文件 | 行数 | 复杂度 | 最大函数复杂度 | 职责 | 来源 |
|---|---:|---:|---:|---|---|
| `src/_builtin/commands/AddToCommand/AddToCommand.ts` | 39 | 5 | 3 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/AddToCommand/AddToCommandContribution.ts` | 27 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/CanvasCommand/CanvasCommand.ts` | 16 | 2 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/CanvasCommand/CanvasCommandContribution.ts` | 32 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/CreateCommand/CreateCommand.ts` | 21 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/CreateCommand/CreateCommandContribution.ts` | 58 | 6 | 2 | create 命令：图形类型名经 ShapeCatalog 查找，本类不含任何类型 switch。 | 注释 |
| `src/_builtin/commands/DeleteCommand/DeleteCommand.ts` | 34 | 5 | 3 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/DeleteCommand/DeleteCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ExitCommand/ExitCommand.ts` | 10 | 1 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ExitCommand/ExitCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/GroupCommand/GroupCommand.ts` | 40 | 6 | 3 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/GroupCommand/GroupCommandContribution.ts` | 34 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/HelpCommand/HelpCommand.ts` | 9 | 1 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/HelpCommand/HelpCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/InitCommand/InitCommand.ts` | 16 | 2 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/InitCommand/InitCommandContribution.ts` | 32 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/MoveCommand/MoveCommand.ts` | 47 | 6 | 4 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/MoveCommand/MoveCommandContribution.ts` | 26 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ReadCommand/ReadCommand.ts` | 13 | 2 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ReadCommand/ReadCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/RedoCommand/RedoCommand.ts` | 9 | 1 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/RedoCommand/RedoCommandContribution.ts` | 23 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ReorderCommand/BackCommandContribution.ts` | 26 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ReorderCommand/FrontCommandContribution.ts` | 27 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ReorderCommand/ReorderCommand.ts` | 37 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/SaveCommand/SaveCommand.ts` | 13 | 2 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/SaveCommand/SaveCommandContribution.ts` | 28 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ScaleCommand/ScaleCommand.ts` | 39 | 5 | 3 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ScaleCommand/ScaleCommandContribution.ts` | 27 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/SetCommand/EditableAttributeParser.ts` | 30 | 4 | 2 | set 命令用的属性名辅助；白名单本体在 protocol EditableAttributeRules。 | 注释 |
| `src/_builtin/commands/SetCommand/SetCommand.ts` | 72 | 10 | 4 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/SetCommand/SetCommandContribution.ts` | 33 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ShowCommand/ShowCommand.ts` | 13 | 2 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/ShowCommand/ShowCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/TreeCommand/TreeCommand.ts` | 13 | 2 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/TreeCommand/TreeCommandContribution.ts` | 28 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/UndoCommand/UndoCommand.ts` | 9 | 1 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/UndoCommand/UndoCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/UngroupCommand/UngroupCommand.ts` | 31 | 4 | 2 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/commands/UngroupCommand/UngroupCommandContribution.ts` | 24 | 3 | 1 | Phase 1 内置命令及其贡献 | 目录 |
| `src/_builtin/shapes/CircleShape/CircleShapeContribution.ts` | 61 | 7 | 2 | Phase 1 内置图形贡献 | 目录 |
| `src/_builtin/shapes/EllipseShape/EllipseShapeContribution.ts` | 63 | 7 | 2 | Phase 1 内置图形贡献 | 目录 |
| `src/_builtin/shapes/GroupShape/GroupShapeContribution.ts` | 37 | 6 | 2 | 普通 g：认领任意 `<g>`；装配时须排在带 data-kind 的复合图形之后。 | 注释 |
| `src/_builtin/shapes/LineShape/LineShapeContribution.ts` | 63 | 7 | 2 | Phase 1 内置图形贡献 | 目录 |
| `src/_builtin/shapes/RectShape/RectShapeContribution.ts` | 63 | 7 | 2 | Phase 1 内置图形贡献 | 目录 |
| `src/_builtin/shapes/TextShape/TextShapeContribution.ts` | 55 | 7 | 2 | Phase 1 内置图形贡献 | 目录 |
| `src/cli/io/ConsoleInputReader.ts` | 66 | 11 | 4 | 输入输出端口与控制台适配 | 目录 |
| `src/cli/io/ConsoleOutputWriter.ts` | 11 | 2 | 1 | 输入输出端口与控制台适配 | 目录 |
| `src/cli/io/InputReader.ts` | 3 | 0 | 0 | 输入输出端口与控制台适配 | 目录 |
| `src/cli/io/OutputWriter.ts` | 4 | 0 | 0 | 输入输出端口与控制台适配 | 目录 |
| `src/cli/parser/CommandLineParser.ts` | 52 | 6 | 5 | CLI 命令解析入口，只负责词法、目录查询和结果包装。 | 注释 |
| `src/cli/parser/CommandParser.ts` | 8 | 0 | 0 | 把一行 CLI 输入解释为命令、空输入或语法错误。 | 注释 |
| `src/cli/parser/results/CommandParseEmptyResult.ts` | 10 | 1 | 1 | 文本到命令对象的解析 | 目录 |
| `src/cli/parser/results/CommandParseErrorResult.ts` | 18 | 2 | 1 | 文本到命令对象的解析 | 目录 |
| `src/cli/parser/results/CommandParseResult.ts` | 11 | 0 | 0 | 文本到命令对象的解析 | 目录 |
| `src/cli/parser/results/CommandParseSuccessResult.ts` | 18 | 2 | 1 | 文本到命令对象的解析 | 目录 |
| `src/cli/parser/syntax/CommandLineTokenizer.ts` | 57 | 11 | 8 | 把一行 CLI 文本切分为带引号感知的参数。 | 注释 |
| `src/cli/session/CommandLoop.ts` | 39 | 7 | 6 | CLI 的交互控制循环，只负责提示、读取和终止。 | 注释 |
| `src/cli/session/CommandSession.ts` | 49 | 7 | 5 | 处理一次交互输入，并决定会话是否继续。 | 注释 |
| `src/cli/session/CommandSessionStatus.ts` | 4 | 0 | 0 | REPL 会话循环 | 目录 |
| `src/core/CommandExecutor.ts` | 42 | 7 | 6 | 命令执行与编排 | 目录 |
| `src/core/attributes/AttributeRegistry.ts` | 49 | 9 | 2 | 运行时属性处理器注册表；同名拒绝；多处理器同时命中则报错。 | 注释 |
| `src/core/commands/CommandRegistry.ts` | 35 | 6 | 2 | 运行时命令注册表：维护插入顺序并拒绝同名命令。 | 注释 |
| `src/core/display/HelpText.ts` | 28 | 4 | 3 | 从命令目录渲染 Phase 1 help 文本。 | 注释 |
| `src/core/display/ShapeDetailVisitor.ts` | 64 | 9 | 3 | tree/show/help 展示 | 目录 |
| `src/core/display/ShapeSummaryVisitor.ts` | 82 | 11 | 3 | tree/show/help 展示 | 目录 |
| `src/core/display/TreeDisplay.ts` | 121 | 25 | 4 | tree/show/help 展示 | 目录 |
| `src/core/document/Document.ts` | 168 | 33 | 4 | 文档状态与图形层级 | 目录 |
| `src/core/document/ShapeHierarchy.ts` | 606 | 122 | 14 | 文档状态与图形层级 | 目录 |
| `src/core/document/ShapeIndex.ts` | 100 | 21 | 4 | 文档状态与图形层级 | 目录 |
| `src/core/history/CommandHistory.ts` | 85 | 14 | 4 | undo/redo 历史栈 | 目录 |
| `src/core/io/FileSvgStorage.ts` | 12 | 2 | 1 | SVG 读写与存储 | 目录 |
| `src/core/io/ParsedSvgDocument.ts` | 21 | 4 | 1 | SVG 读写与存储 | 目录 |
| `src/core/io/SvgDocumentParser.ts` | 317 | 64 | 7 | SVG 读写与存储 | 目录 |
| `src/core/io/SvgDocumentWriter.ts` | 46 | 9 | 2 | SVG 读写与存储 | 目录 |
| `src/core/io/SvgShapeIdAllocator.ts` | 38 | 7 | 6 | SVG 读写与存储 | 目录 |
| `src/core/io/SvgShapeWriter.ts` | 119 | 35 | 5 | SVG 读写与存储 | 目录 |
| `src/core/io/SvgStorage.ts` | 4 | 0 | 0 | SVG 读写与存储 | 目录 |
| `src/core/io/XmlEscaper.ts` | 14 | 2 | 1 | SVG 读写与存储 | 目录 |
| `src/core/receiver/EditorCommandReceiver.ts` | 174 | 25 | 1 | 命令接收者实现 | 目录 |
| `src/core/receiver/EditorDocumentCommandReceiver.ts` | 141 | 20 | 5 | 命令接收者实现 | 目录 |
| `src/core/receiver/EditorShapeCommandReceiver.ts` | 177 | 22 | 2 | 命令接收者实现 | 目录 |
| `src/core/receiver/EditorViewCommandReceiver.ts` | 44 | 6 | 2 | 命令接收者实现 | 目录 |
| `src/core/shapes/ShapeRegistry.ts` | 42 | 8 | 2 | 运行时图形贡献注册表：拒绝重复类型名；SVG 匹配按注册顺序取首个命中。 | 注释 |
| `src/core/tree/TreeDecoratorRegistry.ts` | 29 | 5 | 2 | 运行时树标签注册表；拒绝重复名称。 | 注释 |
| `src/protocol/attributes/AttributeCatalog.ts` | 8 | 0 | 0 | 只读属性处理器目录。 | 注释 |
| `src/protocol/attributes/AttributeHandler.ts` | 29 | 0 | 0 | 属性扩展点：定义「对某类图形设置某属性」的领域语义。 | 注释 |
| `src/protocol/attributes/EditableAttributeRules.ts` | 62 | 4 | 2 | Phase 1 属性白名单：无 AttributeHandler 命中时的回退规则。 | 注释 |
| `src/protocol/commands/Command.ts` | 6 | 0 | 0 | 命令基类、贡献契约与撤销快照 | 目录 |
| `src/protocol/commands/UndoableCommand.ts` | 26 | 2 | 1 | 命令基类、贡献契约与撤销快照 | 目录 |
| `src/protocol/commands/contribution/CommandCatalog.ts` | 9 | 0 | 0 | 只读命令目录：按名称查找贡献对象，并按注册顺序枚举。 | 注释 |
| `src/protocol/commands/contribution/CommandContribution.ts` | 52 | 8 | 3 | 命令扩展点（抽象类）：一条命令的名称、usage、可选 help，以及参数 → Command 的工厂。 | 注释 |
| `src/protocol/commands/contribution/CommandHelp.ts` | 25 | 5 | 3 | 封装单条命令在 help 输出中的 usage 与描述。 | 注释 |
| `src/protocol/commands/contribution/CommandParameters.ts` | 105 | 20 | 3 | 封装命令参数（不含命令名）的元数校验和类型转换。 | 注释 |
| `src/protocol/commands/memento/ShapeAttributeSnapshot.ts` | 63 | 8 | 1 | 命令基类、贡献契约与撤销快照 | 目录 |
| `src/protocol/commands/memento/ShapePlacement.ts` | 34 | 6 | 3 | 命令基类、贡献契约与撤销快照 | 目录 |
| `src/protocol/errors/CommandErrorCode.ts` | 19 | 0 | 0 | 错误模型 | 目录 |
| `src/protocol/errors/ErrorSource.ts` | 6 | 0 | 0 | 错误模型 | 目录 |
| `src/protocol/errors/ProtocolError.ts` | 59 | 8 | 1 | 错误模型 | 目录 |
| `src/protocol/errors/dto/CommandErrorDto.ts` | 6 | 0 | 0 | 错误模型 | 目录 |
| `src/protocol/execution/Executor.ts` | 6 | 0 | 0 | 执行器接口 | 目录 |
| `src/protocol/io/DirectoryEntry.ts` | 33 | 10 | 6 | 目录直接子项的领域对象；名称不含路径分隔符。 | 注释 |
| `src/protocol/io/DirectoryEntryKind.ts` | 5 | 0 | 0 | 目录列举项类型（不含符号链接等特殊项的细分约定由适配器文档说明）。 | 注释 |
| `src/protocol/io/DirectoryListing.ts` | 10 | 0 | 0 | 目录列举端口（Adapter Target）。 | 注释 |
| `src/protocol/plugins/PluginContext.ts` | 21 | 0 | 0 | 插件激活上下文：唯一注册入口。 | 注释 |
| `src/protocol/plugins/PluginContributes.ts` | 138 | 34 | 5 | 插件清单：来自 package.json 的 contributes，进入宿主前归一化。 | 注释 |
| `src/protocol/plugins/SvgPlugin.ts` | 11 | 0 | 0 | 可装入的 SVG 编辑器插件。 | 注释 |
| `src/protocol/receivers/CommandReceiver.ts` | 11 | 0 | 0 | 聚合命令执行所需的全部编辑能力。 | 注释 |
| `src/protocol/receivers/DocumentCommandReceiver.ts` | 15 | 0 | 0 | 接收者接口 | 目录 |
| `src/protocol/receivers/HistoryCommandReceiver.ts` | 6 | 0 | 0 | 接收者接口 | 目录 |
| `src/protocol/receivers/ShapeCommandReceiver.ts` | 25 | 0 | 0 | 接收者接口 | 目录 |
| `src/protocol/receivers/ViewCommandReceiver.ts` | 7 | 0 | 0 | 接收者接口 | 目录 |
| `src/protocol/results/CommandResult.ts` | 7 | 0 | 0 | 命令结果模型 | 目录 |
| `src/protocol/results/dto/CommandResultDto.ts` | 6 | 0 | 0 | 命令结果模型 | 目录 |
| `src/protocol/results/outcomes/CommandErrorResult.ts` | 20 | 3 | 1 | 命令结果模型 | 目录 |
| `src/protocol/results/outcomes/CommandExitResult.ts` | 12 | 2 | 1 | 命令结果模型 | 目录 |
| `src/protocol/results/outcomes/CommandSuccessResult.ts` | 19 | 3 | 1 | 命令结果模型 | 目录 |
| `src/protocol/shapes/concrete/CircleShape.ts` | 84 | 14 | 4 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/concrete/EllipseShape.ts` | 93 | 16 | 5 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/concrete/GroupShape.ts` | 146 | 36 | 7 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/concrete/LineShape.ts` | 95 | 16 | 5 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/concrete/RectShape.ts` | 93 | 16 | 5 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/concrete/TextShape.ts` | 83 | 14 | 4 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/contribution/ShapeArgumentParser.ts` | 68 | 12 | 4 | 供各 ShapeContribution 复用的参数校验与数字解析。 | 注释 |
| `src/protocol/shapes/contribution/ShapeCatalog.ts` | 11 | 0 | 0 | 只读图形贡献目录。 | 注释 |
| `src/protocol/shapes/contribution/ShapeContribution.ts` | 28 | 3 | 2 | 图形扩展点（抽象类；Phase 2 角色名 ShapeProvider）： | 注释 |
| `src/protocol/shapes/contribution/ShapeSvgReadInput.ts` | 37 | 7 | 2 | SVG 读回边界输入：Parser 已抽出属性与子树，不携带 XML 库类型。 | 注释 |
| `src/protocol/shapes/model/EditableAttribute.ts` | 19 | 0 | 0 | 可通过命令修改的图形属性。 | 注释 |
| `src/protocol/shapes/model/Shape.ts` | 106 | 15 | 3 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/model/ShapePosition.ts` | 14 | 3 | 1 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/model/ShapeType.ts` | 8 | 0 | 0 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/model/StyledShape.ts` | 91 | 15 | 4 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/shapes/visitor/ShapeVisitor.ts` | 15 | 0 | 0 | 图形领域模型与贡献契约 | 目录 |
| `src/protocol/tree/TreeDecorator.ts` | 29 | 3 | 1 | 树行标签扩展点：为 tree 行尾追加文案。 | 注释 |
| `src/protocol/tree/TreeDecoratorCatalog.ts` | 6 | 0 | 0 | 只读树标签目录。 | 注释 |

### 装配处

| 文件 | 行数 | 复杂度 | 最大函数复杂度 | 职责 | 来源 |
|---|---:|---:|---:|---|---|
| `src/assembly/BuiltinContributionInstaller.ts` | 81 | 4 | 1 | 组合根侧：把 Phase 1 内置命令与六种图形装入注册表。 | 注释 |
| `src/assembly/CodePluginInstaller.ts` | 38 | 2 | 1 | 方式 A（改代码）：组合根显式实例化并装入插件；新增插件只改本文件。 | 注释 |
| `src/host/DuplicateRegistrationError.ts` | 10 | 1 | 1 | 同类扩展名冲突；宿主格式化为 error: duplicate registration: category/name。 | 注释 |
| `src/host/PluginActivationContext.ts` | 133 | 36 | 5 | 一次 activate 的暂存注册；commit 前不写入正式表。 | 注释 |
| `src/host/PluginConfig.ts` | 25 | 8 | 5 | 根级 plugins.config.json。 | 注释 |
| `src/host/PluginConfigEntry.ts` | 55 | 17 | 13 | 配置文件中单条插件项（边界结构，进入宿主前校验）。 | 注释 |
| `src/host/PluginConfigLoader.ts` | 27 | 4 | 4 | 读取并解析 plugins.config.json；结构非法时抛错。 | 注释 |
| `src/host/PluginHost.ts` | 85 | 7 | 5 | 插件宿主、配置与模块加载 | 目录 |
| `src/host/PluginModuleLoader.ts` | 131 | 25 | 12 | 插件宿主、配置与模块加载 | 目录 |
| `src/host/loadPluginsFromConfig.ts` | 55 | 9 | 8 | 插件宿主、配置与模块加载 | 目录 |
| `src/host/parseConfigArg.ts` | 25 | 7 | 7 | 从 argv 解析 `--config <path>`；缺省返回 undefined（方式 A）。 | 注释 |
| `src/main.ts` | 81 | 3 | 2 | 组合根：组装 CLI、Core、宿主与装配 | 目录 |

### 插件

| 文件 | 行数 | 复杂度 | 最大函数复杂度 | 职责 | 来源 |
|---|---:|---:|---:|---|---|
| `src/_plugin/commands/DirCommand/DirCommand.ts` | 64 | 13 | 4 | 命令插件包 | 目录 |
| `src/_plugin/commands/DirCommand/DirCommandContribution.ts` | 32 | 4 | 2 | dir 命令贡献：目录访问经 DirectoryListing 端口注入（适配器模式的 Target）。 | 注释 |
| `src/_plugin/commands/DirCommand/DirCommandPlugin.ts` | 19 | 2 | 2 | dir 命令插件；options.directoryPath 可覆盖工作目录。 | 注释 |
| `src/_plugin/commands/DirCommand/NodeDirectoryListing.ts` | 29 | 5 | 5 | DirectoryListing 的 Node 适配器（Adapter）。 | 注释 |
| `src/_plugin/commands/DirCommand/index.ts` | 2 | 0 | 0 | 命令插件包 | 目录 |
| `src/_plugin/commands/StatsCommand/DocumentShapeStats.ts` | 48 | 9 | 4 | 画布形状统计结果：叶子按首次出现类型顺序计数，容器单独累计。 | 注释 |
| `src/_plugin/commands/StatsCommand/StatsCommand.ts` | 12 | 1 | 1 | 命令插件包 | 目录 |
| `src/_plugin/commands/StatsCommand/StatsCommandContribution.ts` | 20 | 3 | 1 | 命令插件包 | 目录 |
| `src/_plugin/commands/StatsCommand/StatsCommandPlugin.ts` | 14 | 1 | 1 | stats 命令插件。 | 注释 |
| `src/_plugin/commands/StatsCommand/index.ts` | 2 | 0 | 0 | 命令插件包 | 目录 |
| `src/_plugin/shapes/BoxShape/BoxAttributeHandler.ts` | 109 | 19 | 3 | box 的 fill → 内部 rect；label → 内部 text。 | 注释 |
| `src/_plugin/shapes/BoxShape/BoxShape.ts` | 101 | 17 | 3 | 带标题的矩形框：插件领域对象，放在 `_plugin` 而非 protocol/concrete。 | 注释 |
| `src/_plugin/shapes/BoxShape/BoxShapeContribution.ts` | 44 | 6 | 2 | box 图形扩展点实现：创建模板、`g[data-kind=box]` 认领与读回校验。 | 注释 |
| `src/_plugin/shapes/BoxShape/BoxShapePlugin.ts` | 21 | 1 | 1 | box 图形插件：形状 + 属性处理器 + (box) 树标签。 | 注释 |
| `src/_plugin/shapes/BoxShape/BoxTypeLabelDecorator.ts` | 13 | 3 | 2 | 在 data-kind=box 的容器行追加 ` (box)`。 | 注释 |
| `src/_plugin/shapes/BoxShape/index.ts` | 2 | 0 | 0 | 图形插件包 | 目录 |
| `src/_plugin/tree/ModifiedStarDecorator.ts` | 119 | 26 | 6 | 相对上次 init/read/save 的内容指纹比较；不一致则行尾追加 ` *`。 | 注释 |
| `src/_plugin/tree/ModifiedStarPlugin.ts` | 14 | 1 | 1 | modified-star 树标签插件。 | 注释 |

### VSCode 扩展（单独列出）

| 文件 | 行数 | 复杂度 | 最大函数复杂度 | 职责 | 来源 |
|---|---:|---:|---:|---|---|
| `vscode-extension/src/extension.ts` | 18 | 2 | 1 | VSCode 扩展 | 目录 |
| `vscode-extension/src/file/SvgFileDecorationProvider.ts` | 33 | 5 | 5 | VSCode 扩展 | 目录 |
| `vscode-extension/src/model/SvgDocumentNode.ts` | 17 | 3 | 1 | VSCode 扩展 | 目录 |
| `vscode-extension/src/model/SvgElementNode.ts` | 43 | 8 | 2 | VSCode 扩展 | 目录 |
| `vscode-extension/src/model/SvgNode.ts` | 5 | 0 | 0 | VSCode 扩展 | 目录 |
| `vscode-extension/src/model/SvgOffsetRange.ts` | 23 | 7 | 5 | VSCode 扩展 | 目录 |
| `vscode-extension/src/outline/SvgDocumentSymbolProvider.ts` | 65 | 7 | 4 | VSCode 扩展 | 目录 |
| `vscode-extension/src/parser/SvgOutlineParser.ts` | 447 | 99 | 26 | VSCode 扩展 | 目录 |
| `vscode-extension/src/test/integration/index.ts` | 246 | 18 | 4 | VSCode 扩展 | 目录 |
| `vscode-extension/src/test/runTest.ts` | 34 | 5 | 3 | VSCode 扩展 | 目录 |
| `vscode-extension/src/test/unit/SvgOutlineParser.test.ts` | 79 | 8 | 1 | VSCode 扩展 | 目录 |
| `vscode-extension/src/test/unit/SvgOutlineVisitor.test.ts` | 26 | 2 | 1 | VSCode 扩展 | 目录 |
| `vscode-extension/src/visitor/SvgNodeVisitor.ts` | 8 | 0 | 0 | VSCode 扩展 | 目录 |
| `vscode-extension/src/visitor/SvgOutlineVisitor.ts` | 19 | 3 | 1 | VSCode 扩展 | 目录 |
| `vscode-extension/src/visitor/SvgSymbolDto.ts` | 30 | 5 | 1 | VSCode 扩展 | 目录 |

## 机器可读

见同目录 [`inventory.json`](./inventory.json)。
