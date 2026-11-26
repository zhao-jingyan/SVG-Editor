# ADR 0007：命令按目录聚拢与名字分派集中

## 状态

已采纳

## 背景

Phase 1 的命令身份靠封闭的 `CommandType` 枚举和各命令的 `type` 字段表达，命令参数解释则集中在若干“命令族 Parser”里。新增一条命令时，需要同时改枚举、族 Parser、Executor 的分派和 help 文本，改动散落在多个文件中。

Phase 2 需要插件命令与内置命令使用同一条注册路径。如果命令身份仍由封闭枚举表达，插件就无法新增命令而不修改内核。

## 决策

1. **每条命令一个目录**：内置命令位于 `src/_builtin/commands/XxxCommand/`，同目录放置 `Command` 子类（或 `UndoableCommand` 子类）与 `XxxCommandContribution`。`front` 与 `back` 同属 `ReorderCommand/`，因为二者共享排序逻辑。
2. **命令身份由贡献表达**：命令名由 `CommandContribution.getName()` 给出，构造器校验名称非空。删除 `CommandType` 与各命令的 `type` 字段（提交 `b543754`）。撤销诊断使用构造器名称，而不是枚举值。
3. **参数解释内联到贡献**：每条命令的参数解析放在对应贡献的 `buildCommand` 中（提交 `1c90574`、`d2d76ad`），删除命令族 Parser。`set` 的属性校验因为被 `set` 独占，所以保留在 `EditableAttributeParser` 中，并只服务 `set`。
4. **名字分派只在一处**：`CommandRegistry`（Core）是运行时实现，`CommandCatalog` 是只读契约。`CommandLineParser` 通过 `catalog.find(name)` 取得贡献后调用 `createCommand`。插件通过 `PluginContext.registerCommand` 进入同一个注册表，同名命令直接拒绝（`duplicate command`）。
5. **装配顺序集中**：内置命令的注册顺序由 `BuiltinContributionInstaller.installCommands` 给出，与 Phase 1 的 help 顺序一致。

## 后果

- 新增内置命令：新建目录、写一个贡献、在 `installCommands` 加一行。解析器与执行器不需要改动。
- 新增插件命令：实现 `CommandContribution` 并通过 `PluginContext` 注册，内核不需要知道命令名。
- 命令名到实现的分派只存在于 `CommandRegistry` 一处，满足 AGENTS 中“按名字分派只允许两个集中点”的规则。
- help 输出顺序依赖注册顺序，因此 `installCommands` 的顺序是可见的契约，修改时需要同步看 help 测试。
- 代价：命令目录数量多，同一能力的 `Command` 与贡献分布在两个文件里（但同目录）。

## 替代方案

- **封闭 `CommandType` 枚举 + Executor 大 `switch`（Phase 1 形态）**：新增命令必须修改枚举和分派，插件无法注册，已删除。
- **每个命令族一个 Parser**：族内仍有分派，族与族之间的边界模糊，且插件无法加入已有族，已删除。
- **反射或目录扫描自动注册**：注册顺序隐式，无法保证 help 与装配顺序，也无法在组合根看到完整清单，不采用。

## 代码锚点

- 命令契约：`src/protocol/commands/contribution/CommandContribution.ts`、`CommandCatalog.ts`
- 运行时注册表：`src/core/commands/CommandRegistry.ts`
- 解析器分派：`src/cli/parser/CommandLineParser.ts`
- 内置装配：`src/assembly/BuiltinContributionInstaller.ts`（`installCommands`）
- 示例：`src/_builtin/commands/ReorderCommand/`（front/back 同目录）、`src/_builtin/commands/CreateCommand/CreateCommandContribution.ts`
- 事实文档：`docs/facts/cli-core-boundary.md`
