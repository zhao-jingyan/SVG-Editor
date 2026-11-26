# ADR 0010：文件系统访问经 DirectoryListing 端口，不经 CommandReceiver

## 状态

已采纳

## 背景

`dir` 命令需要列出工作目录内容。这是 Phase 2 第一次引入“命令需要读取文件系统”的能力。如果直接在命令中调用 `node:fs`，会有三个问题：

- `_plugin` 的依赖规则只允许 `protocol` 与自身，直接访问 Node 文件系统会绕过 `protocol` 的契约边界，难以替换；
- 测试无法在不触碰真实目录的情况下覆盖排序、符号链接、读取失败等分支；
- 如果把“列目录”加到 `CommandReceiver` 上，文件系统能力会混入文档编辑接口，破坏 Phase 1 中“Receiver 只负责文档与图形状态”的约定。

## 决策

1. **端口放在协议层**：`protocol/io/DirectoryListing`（接口）与 `DirectoryEntry`、`DirectoryEntryKind` 描述列举结果。接口只有 `list(path)`，返回只读的条目列表。
2. **适配器放在插件包内**：`NodeDirectoryListing` 位于 `_plugin/commands/DirCommand/`，实现 `DirectoryListing` 并使用 `node:fs`。`_plugin` 的 lint 规则允许 `node:` 适配器。
3. **依赖注入**：`DirCommandContribution.create(directoryListing = new NodeDirectoryListing(), directoryPath?)` 默认使用真实适配器，测试与替代实现可以注入替身。
4. **失败语义**：端口实现负责在读取失败时抛错，命令层把异常转换为命令错误结果，不让异常穿透 Executor。
5. **文档结构只读查询走 Receiver，目录列举不走 Receiver**：`DocumentCommandReceiver` 只新增通用只读的 `getRootShapes()`（提交 `86f3c67`），不新增任何文件系统方法。

## 后果

- `dir` 的排序、符号链接显示、空目录、读取失败等行为可以用内存替身测试，与文件系统解耦。
- 文件系统能力的边界清晰：目录列举不进入 Core，`protocol` 只定义端口。Core 中已有的文件访问（`FileSvgStorage`，用于 SVG 读写）属于另一条既有边界，不受本决策影响。
- 代价：插件包内携带一个默认适配器，若将来有第二个运行环境，需要通过 `create` 注入而不是修改插件。
- 符号链接等特殊项的显示规则由适配器决定（见 `doc/README.md` §11），这一规则属于适配器的职责，不属于命令。

## 替代方案

- **把 `listDirectory` 加到 `CommandReceiver`**：文件系统能力混入文档编辑接口，Receiver 的职责边界被破坏，不采用。
- **命令直接调用 `node:fs`**：绕过端口，测试只能依赖真实目录，不采用。
- **Core 提供统一的文件系统服务**：`dir` 是插件能力，把它的需求提升为 Core 服务会让内核为插件背书，不采用。

## 代码锚点

- 端口：`src/protocol/io/DirectoryListing.ts`、`DirectoryEntry.ts`、`DirectoryEntryKind.ts`
- 适配器：`src/_plugin/commands/DirCommand/NodeDirectoryListing.ts`
- 命令与注入点：`src/_plugin/commands/DirCommand/DirCommand.ts`、`DirCommandContribution.ts`
- 只读查询：`src/protocol/receivers/`（`getRootShapes()`，提交 `86f3c67`）
- 测试：`tests/_plugin/commands/DirCommand/DirCommand.test.ts`
- 事实文档：`docs/facts/cli-core-boundary.md`；`doc/README.md` §11
