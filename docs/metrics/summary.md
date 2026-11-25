# CLI Metrics（自动生成）

> 由 `npm run metrics`（`scripts/generate-metrics.mjs`）从 git 生成。  
> 基线：`final` → 对比：`HEAD`  
> 生成时间：2026-11-25T17:14:46.987Z

## 分类规则

| 类别 | 路径 |
|---|---|
| 内核 | `src/protocol`、`src/core`、`src/cli`、`src/_builtin` |
| 装配处 | `src/main.ts`、`src/host` |
| 插件 | `src/_plugin` |

VSCode 扩展单独列出，不混入本表。`node_modules` / `dist` 排除。

## final 快照

| 类别 | 文件数 | 行数 | 复杂度估计 |
|---|---:|---:|---:|
| 内核 | 94 | 5055 | 526 |
| 装配处 | 1 | 39 | 2 |
| 插件 | 0 | 0 | 0 |

## HEAD 快照

| 类别 | 文件数 | 行数 | 复杂度估计 |
|---|---:|---:|---:|
| 内核 | 135 | 6147 | 619 |
| 装配处 | 12 | 726 | 77 |
| 插件 | 18 | 650 | 62 |

## 增量（HEAD − final）

| 类别 | 行数 Δ | 复杂度 Δ |
|---|---:|---:|
| 内核 | 1092 | 93 |
| 装配处 | 687 | 75 |
| 插件 | 650 | 62 |

## 文件职责清单（HEAD）

### 内核

- `src/_builtin/commands/AddToCommand/AddToCommand.ts` — 40 行 / 复杂度 4
- `src/_builtin/commands/AddToCommand/AddToCommandContribution.ts` — 21 行 / 复杂度 1
- `src/_builtin/commands/CanvasCommand/CanvasCommand.ts` — 17 行 / 复杂度 3
- `src/_builtin/commands/CanvasCommand/CanvasCommandContribution.ts` — 26 行 / 复杂度 2
- `src/_builtin/commands/CreateCommand/CreateCommand.ts` — 22 行 / 复杂度 2
- `src/_builtin/commands/CreateCommand/CreateCommandContribution.ts` — 62 行 / 复杂度 5
- `src/_builtin/commands/DeleteCommand/DeleteCommand.ts` — 35 行 / 复杂度 4
- `src/_builtin/commands/DeleteCommand/DeleteCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/commands/ExitCommand/ExitCommand.ts` — 11 行 / 复杂度 1
- `src/_builtin/commands/ExitCommand/ExitCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/commands/GroupCommand/GroupCommand.ts` — 41 行 / 复杂度 4
- `src/_builtin/commands/GroupCommand/GroupCommandContribution.ts` — 28 行 / 复杂度 2
- `src/_builtin/commands/HelpCommand/HelpCommand.ts` — 10 行 / 复杂度 1
- `src/_builtin/commands/HelpCommand/HelpCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/commands/InitCommand/InitCommand.ts` — 17 行 / 复杂度 3
- `src/_builtin/commands/InitCommand/InitCommandContribution.ts` — 26 行 / 复杂度 2
- `src/_builtin/commands/MoveCommand/MoveCommand.ts` — 48 行 / 复杂度 5
- `src/_builtin/commands/MoveCommand/MoveCommandContribution.ts` — 20 行 / 复杂度 1
- `src/_builtin/commands/ReadCommand/ReadCommand.ts` — 14 行 / 复杂度 1
- `src/_builtin/commands/ReadCommand/ReadCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/commands/RedoCommand/RedoCommand.ts` — 10 行 / 复杂度 1
- `src/_builtin/commands/RedoCommand/RedoCommandContribution.ts` — 17 行 / 复杂度 1
- `src/_builtin/commands/ReorderCommand/BackCommandContribution.ts` — 20 行 / 复杂度 1
- `src/_builtin/commands/ReorderCommand/FrontCommandContribution.ts` — 21 行 / 复杂度 1
- `src/_builtin/commands/ReorderCommand/ReorderCommand.ts` — 38 行 / 复杂度 3
- `src/_builtin/commands/SaveCommand/SaveCommand.ts` — 14 行 / 复杂度 2
- `src/_builtin/commands/SaveCommand/SaveCommandContribution.ts` — 22 行 / 复杂度 2
- `src/_builtin/commands/ScaleCommand/ScaleCommand.ts` — 40 行 / 复杂度 4
- `src/_builtin/commands/ScaleCommand/ScaleCommandContribution.ts` — 21 行 / 复杂度 1
- `src/_builtin/commands/SetCommand/EditableAttributeParser.ts` — 31 行 / 复杂度 2
- `src/_builtin/commands/SetCommand/SetCommand.ts` — 81 行 / 复杂度 10
- `src/_builtin/commands/SetCommand/SetCommandContribution.ts` — 30 行 / 复杂度 2
- `src/_builtin/commands/ShowCommand/ShowCommand.ts` — 14 行 / 复杂度 1
- `src/_builtin/commands/ShowCommand/ShowCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/commands/TreeCommand/TreeCommand.ts` — 14 行 / 复杂度 2
- `src/_builtin/commands/TreeCommand/TreeCommandContribution.ts` — 22 行 / 复杂度 2
- `src/_builtin/commands/UndoCommand/UndoCommand.ts` — 10 行 / 复杂度 1
- `src/_builtin/commands/UndoCommand/UndoCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/commands/UngroupCommand/UngroupCommand.ts` — 32 行 / 复杂度 3
- `src/_builtin/commands/UngroupCommand/UngroupCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_builtin/shapes/CircleShape/CircleShapeContribution.ts` — 54 行 / 复杂度 2
- `src/_builtin/shapes/EllipseShape/EllipseShapeContribution.ts` — 56 行 / 复杂度 2
- `src/_builtin/shapes/GroupShape/GroupShapeContribution.ts` — 29 行 / 复杂度 2
- `src/_builtin/shapes/LineShape/LineShapeContribution.ts` — 56 行 / 复杂度 2
- `src/_builtin/shapes/RectShape/RectShapeContribution.ts` — 56 行 / 复杂度 2
- `src/_builtin/shapes/TextShape/TextShapeContribution.ts` — 48 行 / 复杂度 2
- `src/cli/io/ConsoleInputReader.ts` — 67 行 / 复杂度 6
- `src/cli/io/ConsoleOutputWriter.ts` — 12 行 / 复杂度 1
- `src/cli/io/InputReader.ts` — 4 行 / 复杂度 1
- `src/cli/io/OutputWriter.ts` — 5 行 / 复杂度 1
- `src/cli/parser/CommandLineParser.ts` — 53 行 / 复杂度 5
- `src/cli/parser/CommandParser.ts` — 9 行 / 复杂度 1
- `src/cli/parser/results/CommandParseEmptyResult.ts` — 11 行 / 复杂度 1
- `src/cli/parser/results/CommandParseErrorResult.ts` — 19 行 / 复杂度 1
- `src/cli/parser/results/CommandParseResult.ts` — 12 行 / 复杂度 1
- `src/cli/parser/results/CommandParseSuccessResult.ts` — 19 行 / 复杂度 1
- `src/cli/parser/syntax/CommandLineTokenizer.ts` — 58 行 / 复杂度 10
- `src/cli/session/CommandLoop.ts` — 40 行 / 复杂度 7
- `src/cli/session/CommandSession.ts` — 50 行 / 复杂度 5
- `src/cli/session/CommandSessionStatus.ts` — 5 行 / 复杂度 1
- `src/core/attributes/AttributeRegistry.ts` — 50 行 / 复杂度 4
- `src/core/CommandExecutor.ts` — 34 行 / 复杂度 5
- `src/core/commands/CommandRegistry.ts` — 36 行 / 复杂度 3
- `src/core/display/HelpText.ts` — 29 行 / 复杂度 3
- `src/core/display/ShapeDetailVisitor.ts` — 65 行 / 复杂度 3
- `src/core/display/ShapeSummaryVisitor.ts` — 83 行 / 复杂度 4
- `src/core/display/TreeDisplay.ts` — 122 行 / 复杂度 12
- `src/core/document/Document.ts` — 169 行 / 复杂度 10
- `src/core/document/ShapeHierarchy.ts` — 590 行 / 复杂度 83
- `src/core/document/ShapeIndex.ts` — 101 行 / 复杂度 12
- `src/core/history/CommandHistory.ts` — 86 行 / 复杂度 7
- `src/core/io/FileSvgStorage.ts` — 13 行 / 复杂度 1
- `src/core/io/ParsedSvgDocument.ts` — 22 行 / 复杂度 1
- `src/core/io/SvgDocumentParser.ts` — 318 行 / 复杂度 44
- `src/core/io/SvgDocumentWriter.ts` — 47 行 / 复杂度 4
- `src/core/io/SvgShapeIdAllocator.ts` — 39 行 / 复杂度 7
- `src/core/io/SvgShapeWriter.ts` — 120 行 / 复杂度 23
- `src/core/io/SvgStorage.ts` — 5 行 / 复杂度 1
- `src/core/io/XmlEscaper.ts` — 15 行 / 复杂度 1
- `src/core/receiver/EditorCommandReceiver.ts` — 175 行 / 复杂度 8
- `src/core/receiver/EditorDocumentCommandReceiver.ts` — 142 行 / 复杂度 18
- `src/core/receiver/EditorShapeCommandReceiver.ts` — 178 行 / 复杂度 8
- `src/core/receiver/EditorViewCommandReceiver.ts` — 45 行 / 复杂度 3
- `src/core/shapes/ShapeRegistry.ts` — 43 行 / 复杂度 3
- `src/core/tree/TreeDecoratorRegistry.ts` — 30 行 / 复杂度 3
- `src/protocol/attributes/AttributeCatalog.ts` — 9 行 / 复杂度 1
- `src/protocol/attributes/AttributeHandler.ts` — 30 行 / 复杂度 1
- `src/protocol/attributes/EditableAttributeRules.ts` — 63 行 / 复杂度 2
- `src/protocol/commands/Command.ts` — 7 行 / 复杂度 1
- `src/protocol/commands/contribution/CommandCatalog.ts` — 10 行 / 复杂度 1
- `src/protocol/commands/contribution/CommandContribution.ts` — 50 行 / 复杂度 4
- `src/protocol/commands/contribution/CommandHelp.ts` — 26 行 / 复杂度 3
- `src/protocol/commands/contribution/CommandParameters.ts` — 106 行 / 复杂度 10
- `src/protocol/commands/memento/ShapeAttributeSnapshot.ts` — 48 行 / 复杂度 1
- `src/protocol/commands/memento/ShapePlacement.ts` — 35 行 / 复杂度 4
- `src/protocol/commands/UndoableCommand.ts` — 27 行 / 复杂度 1
- `src/protocol/errors/CommandErrorCode.ts` — 18 行 / 复杂度 1
- `src/protocol/errors/dto/CommandErrorDto.ts` — 7 行 / 复杂度 1
- `src/protocol/errors/ErrorSource.ts` — 7 行 / 复杂度 1
- `src/protocol/errors/ProtocolError.ts` — 60 行 / 复杂度 1
- `src/protocol/execution/Executor.ts` — 7 行 / 复杂度 1
- `src/protocol/io/DirectoryEntry.ts` — 34 行 / 复杂度 6
- `src/protocol/io/DirectoryEntryKind.ts` — 6 行 / 复杂度 1
- `src/protocol/io/DirectoryListing.ts` — 11 行 / 复杂度 1
- `src/protocol/plugins/PluginContext.ts` — 22 行 / 复杂度 1
- `src/protocol/plugins/PluginContributes.ts` — 139 行 / 复杂度 22
- `src/protocol/plugins/SvgPlugin.ts` — 12 行 / 复杂度 1
- `src/protocol/receivers/CommandReceiver.ts` — 12 行 / 复杂度 1
- `src/protocol/receivers/DocumentCommandReceiver.ts` — 16 行 / 复杂度 6
- `src/protocol/receivers/HistoryCommandReceiver.ts` — 7 行 / 复杂度 1
- `src/protocol/receivers/ShapeCommandReceiver.ts` — 26 行 / 复杂度 2
- `src/protocol/receivers/ViewCommandReceiver.ts` — 8 行 / 复杂度 2
- `src/protocol/results/CommandResult.ts` — 8 行 / 复杂度 1
- `src/protocol/results/dto/CommandResultDto.ts` — 7 行 / 复杂度 1
- `src/protocol/results/outcomes/CommandErrorResult.ts` — 21 行 / 复杂度 1
- `src/protocol/results/outcomes/CommandExitResult.ts` — 13 行 / 复杂度 1
- `src/protocol/results/outcomes/CommandSuccessResult.ts` — 20 行 / 复杂度 1
- `src/protocol/shapes/concrete/CircleShape.ts` — 85 行 / 复杂度 10
- `src/protocol/shapes/concrete/EllipseShape.ts` — 94 行 / 复杂度 12
- `src/protocol/shapes/concrete/GroupShape.ts` — 147 行 / 复杂度 20
- `src/protocol/shapes/concrete/LineShape.ts` — 96 行 / 复杂度 12
- `src/protocol/shapes/concrete/RectShape.ts` — 94 行 / 复杂度 12
- `src/protocol/shapes/concrete/TextShape.ts` — 84 行 / 复杂度 10
- `src/protocol/shapes/contribution/ShapeArgumentParser.ts` — 69 行 / 复杂度 9
- `src/protocol/shapes/contribution/ShapeCatalog.ts` — 12 行 / 复杂度 1
- `src/protocol/shapes/contribution/ShapeContribution.ts` — 39 行 / 复杂度 2
- `src/protocol/shapes/contribution/ShapeSvgReadInput.ts` — 38 行 / 复杂度 2
- `src/protocol/shapes/model/EditableAttribute.ts` — 20 行 / 复杂度 1
- `src/protocol/shapes/model/Shape.ts` — 107 行 / 复杂度 8
- `src/protocol/shapes/model/ShapePosition.ts` — 15 行 / 复杂度 1
- `src/protocol/shapes/model/ShapeType.ts` — 9 行 / 复杂度 1
- `src/protocol/shapes/model/StyledShape.ts` — 92 行 / 复杂度 20
- `src/protocol/shapes/visitor/ShapeVisitor.ts` — 16 行 / 复杂度 1
- `src/protocol/tree/TreeDecorator.ts` — 30 行 / 复杂度 1
- `src/protocol/tree/TreeDecoratorCatalog.ts` — 7 行 / 复杂度 1

### 装配处

- `src/host/activateDefaultPlugins.ts` — 34 行 / 复杂度 1
- `src/host/DuplicateRegistrationError.ts` — 11 行 / 复杂度 1
- `src/host/loadPluginsFromConfig.ts` — 56 行 / 复杂度 7
- `src/host/parseConfigArg.ts` — 26 行 / 复杂度 7
- `src/host/PluginActivationContext.ts` — 134 行 / 复杂度 14
- `src/host/PluginConfig.ts` — 26 行 / 复杂度 5
- `src/host/PluginConfigEntry.ts` — 56 行 / 复杂度 13
- `src/host/PluginConfigLoader.ts` — 28 行 / 复杂度 1
- `src/host/PluginHost.ts` — 86 行 / 复杂度 5
- `src/host/PluginModuleLoader.ts` — 108 行 / 复杂度 19
- `src/host/registerBuiltinContributions.ts` — 75 行 / 复杂度 1
- `src/main.ts` — 86 行 / 复杂度 3

### 插件

- `src/_plugin/commands/DirCommand/DirCommand.ts` — 60 行 / 复杂度 4
- `src/_plugin/commands/DirCommand/DirCommandContribution.ts` — 23 行 / 复杂度 3
- `src/_plugin/commands/DirCommand/DirCommandPlugin.ts` — 20 行 / 复杂度 2
- `src/_plugin/commands/DirCommand/index.ts` — 3 行 / 复杂度 1
- `src/_plugin/commands/DirCommand/NodeDirectoryListing.ts` — 30 行 / 复杂度 5
- `src/_plugin/commands/StatsCommand/DocumentShapeStats.ts` — 49 行 / 复杂度 6
- `src/_plugin/commands/StatsCommand/index.ts` — 3 行 / 复杂度 1
- `src/_plugin/commands/StatsCommand/StatsCommand.ts` — 13 行 / 复杂度 1
- `src/_plugin/commands/StatsCommand/StatsCommandContribution.ts` — 18 行 / 复杂度 1
- `src/_plugin/commands/StatsCommand/StatsCommandPlugin.ts` — 15 行 / 复杂度 1
- `src/_plugin/shapes/BoxShape/BoxAttributeHandler.ts` — 109 行 / 复杂度 9
- `src/_plugin/shapes/BoxShape/BoxShape.ts` — 102 行 / 复杂度 6
- `src/_plugin/shapes/BoxShape/BoxShapeContribution.ts` — 37 行 / 复杂度 2
- `src/_plugin/shapes/BoxShape/BoxShapePlugin.ts` — 22 行 / 复杂度 1
- `src/_plugin/shapes/BoxShape/index.ts` — 3 行 / 复杂度 1
- `src/_plugin/tree/BoxTypeLabelDecorator.ts` — 14 行 / 复杂度 2
- `src/_plugin/tree/ModifiedStarDecorator.ts` — 114 行 / 复杂度 15
- `src/_plugin/tree/ModifiedStarPlugin.ts` — 15 行 / 复杂度 1

## 机器可读

见同目录 [`inventory.json`](./inventory.json)。
