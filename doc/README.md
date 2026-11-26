# SVG Editor CLI 架构说明

## 1. 项目范围

本项目实现面向 SVG 图形文档的命令行编辑器。

**Phase 1（tag `final`，版本 `1.0.0`）**

- `init` / `read` / `save` / `canvas` 文档命令；
- `create` / `delete` / `move` / `scale` / `set` / `group` / `ungroup` / `addto` / `front` / `back` 编辑命令；
- `tree` / `show` / `help` 显示命令；
- 九类编辑命令的 `undo` / `redo` 闭环；
- `rect`、`circle`、`ellipse`、`line`、`text`、`g` 六种图形及嵌套容器；
- SVG 子集读写、缺失 id 自动分配与 IO 后的历史锁。

**Phase 2（交付完成后打 tag `p2`，当前未打）**

- 四个扩展点：`ShapeContribution`（角色名 ShapeProvider）、`CommandContribution`、`AttributeHandler`、`TreeDecorator`；
- 命令插件 `stats` / `dir`；图形插件 `box`；树标签 `(box)` 与 `modified-star`；
- 方式 A（代码装配）与方式 B（`plugins.config.json` + `--config`）共用 `PluginHost` 注册路径；
- VSCode 扩展：Explorer `[]` 标记与 Outline 大纲（见第 13 节）。

CLI 通过标准输入逐行读取命令，通过标准输出返回成功摘要或 `error:` 消息。暂不实现复杂 SVG 特性（`defs`、外部引用、复杂 `transform` 等）或独立 GUI 渲染器。

## 2. 模块划分与职责

### 2.1 模块与目录

| 模块 | 职责 | 依赖边界 |
|---|---|---|
| `src/main.ts` | 组合根；组装 CLI/Core，选择方式 A/B 装入插件 | 可依赖 `cli`、`core`、`host`、`assembly`、`protocol` |
| `src/assembly` | 装配：`BuiltinContributionInstaller`（内置命令/图形，`g` 最后注册）、`CodePluginInstaller`（方式 A 的插件清单） | 依赖 `host`、`core`、`protocol`、`_builtin`、`_plugin` |
| `src/host` | 插件宿主与配置加载：`PluginHost`、`PluginModuleLoader`、`loadPluginsFromConfig` | 只依赖 `protocol` + `core`；不导入任何具体插件 |
| `src/cli/io` | `InputReader` / `OutputWriter` 端口及控制台适配器 | 可用 Node `readline`；不依赖 Parser/Session/Core |
| `src/cli/parser` | 切词、参数校验、按 `CommandCatalog` 构造 Command | 仅依赖自身与 `protocol` |
| `src/cli/session` | REPL 与单次输入反馈 | 依赖 `cli/io`、`CommandParser`、`Executor` |
| `src/protocol` | 命令/图形/结果/错误、扩展点契约（Contribution、AttributeHandler、TreeDecorator、SvgPlugin） | 不依赖 `cli`/`core`/`host`/插件/Node/DOM |
| `src/core` | Executor、Receiver、Document、History、Display、SVG IO、各 Registry | 只依赖 `protocol` |
| `src/_builtin` | Phase 1 内置命令与六种图形贡献 | 只依赖 `protocol` |
| `src/_plugin` | 可选插件：stats、dir、box、modified-star（每个插件包独立，互不依赖） | 只依赖 `protocol` 与自身包目录（允许 `node:` 适配器）；由 lint 强制 |
| `scripts` / `tests` | 回归、metrics、双装配校验、E2E | 按对象依赖公开接口 |

实际目录结构如下。README、业务文档和实践说明随模块下沉，避免把全部知识堆在仓库根目录。

```text
src/
├── main.ts
├── host/                            # 插件宿主、配置加载（不含具体插件）
├── assembly/                        # 内置贡献装配、方式 A 插件清单
├── cli/                             # I/O · Parser · Session
├── protocol/                        # 契约与扩展点（含 attributes / tree / plugins）
├── core/                            # Executor · Receiver · Registries · IO
├── _builtin/                        # Phase 1 内置命令/图形贡献
└── _plugin/                         # stats · dir · box · tree 标签插件
```

### 2.2 分层包图

**Phase 1（`final`）**

![SVG Editor CLI 分层架构](./architecture.png)

源文件：[`architecture.puml`](./architecture.puml)。`Protocol` 是 CLI 与 Core 的交换契约，不是第三执行层。

**Phase 2**

源文件：[`architecture-phase2.puml`](./architecture-phase2.puml)（增加 `host`、`_builtin`、`_plugin`）。本地可用 PlantUML 渲染 PNG；未预渲染时以 `.puml` 为准。

### 2.3 命令交换与执行链路

`Command` 不是静态模块块，而是从 CLI Parser 流向 Core Executor / Receiver 的交换对象。命令执行完成后，结果再沿调用链返回 CLI。

![命令交换与执行结果回流](./command-flow.png)

```text
stdin
  -> ConsoleInputReader
  -> CommandLoop
  -> CommandSession
  -> CommandParser
  -> CommandLineParser
  -> CommandLineTokenizer
  -> CommandCatalog / CommandRegistry
  -> CommandContribution
  -> ShapeCatalog / ShapeContribution（create 与 SVG 读回）
  -> 具体 Command
  -> CommandExecutor
  -> command.execute(CommandReceiver)
  -> EditorCommandReceiver
  -> EditorDocument / EditorShape / EditorView Receiver
  -> Document / Shape / CommandHistory
  -> CommandResult
  -> CommandResultDto
  -> stdout
```

- `Command` 是 Protocol 定义的交换对象：CLI Parser 构造它，CLI Session 交给 Core Executor，Executor 再把同一个对象交给 Receiver 执行。
- `Protocol` 同时定义这次交换所需的 Command、Shape、CommandResult、ProtocolError，以及 Executor / Receiver 端口；它本身不执行命令。
- 结果沿相反方向返回：Receiver 返回 `CommandResult` 或 `ProtocolError`，Executor 统一转换错误并在需要时记录可撤销命令，Session 转换为边界 DTO 后输出。
- `CommandLoop` 只负责启动提示、提示符、逐行读取和终止；它不解释解析结果或执行结果。
- `CommandSession` 负责单次输入的交互策略：空输入不输出，解析错误输出 `error: ...`，成功结果输出消息，退出结果结束会话。
- `CommandLineParser` 只负责切词、目录查找、`CommandParameters` 创建和解析结果包装；命令名分派集中在 `CommandCatalog` / `CommandRegistry`。
- 每条内置命令的参数解释落在对应 `CommandContribution` 工厂内；`create` 通过 `ShapeCatalog` 查找 `ShapeContribution` 创建具体图形。
- `CommandExecutor` 调用具体 Command，成功且可撤销时立即记录到 `CommandHistory`，再把 `ProtocolError` 转换为错误结果；未知异常继续上抛，由组合根终止进程。
- `EditorCommandReceiver` 把文档、图形、显示能力委托给三个能力对象，并把 undo/redo 委托给共享 History；它不持有文档状态，历史和当前文档分别由 `CommandHistory` 与 `EditorDocumentCommandReceiver` 管理。
- 具体命令通过 `CommandReceiver` 操作文档，并通过 `ShapePlacement` / `ShapeAttributeSnapshot` 保存局部逆操作状态。
- `CommandHistory` 只保存成功执行过的 `UndoableCommand`，不保存整文档快照。

## 3. 设计模式与落地位置

核心类层次如下：

```text
Command
├── UndoableCommand
│   └── create / delete / move / scale / set / group / ungroup / addto / reorder
├── 文档命令：init / read / save / canvas
├── 显示命令：tree / show / help
├── 历史命令：undo / redo
└── 会话命令：exit

Shape
├── StyledShape
│   ├── RectShape
│   ├── CircleShape
│   ├── EllipseShape
│   ├── LineShape
│   └── TextShape
└── GroupShape
```

这里的 `Command` 是跨层流转的请求对象。CLI Parser 创建它，Core Executor 和 Receiver 消费它；图中的类层次表达对象能力，不代表又增加了一个独立的架构层。

| 模式 | 参与者与代码位置 | 解决的问题 | 替代方案与取舍 |
|---|---|---|---|
| Command | `Command` / `UndoableCommand`、语义族具体命令、作为 Invoker 的 `CommandExecutor`、作为 Receiver 的 `CommandReceiver` | 把每条 CLI 命令封装为具有身份和行为的对象；执行与撤销都通过命令对象完成 | 命令联合类型 + Executor 大 `switch` 会把分发和业务逻辑糅在一起，不采用 |
| Composite | `Shape`、`StyledShape`、`GroupShape` 与五种叶子图形 | 容器和叶子统一支持 move、scale、公共样式 set、delete 和显示遍历 | 在命令或 Receiver 中到处判断 `instanceof GroupShape` 会扩散组合知识，不采用 |
| Contribution / Registry | `ShapeContribution` + `ShapeRegistry`，由 `CreateCommandContribution` 和 `SvgDocumentParser` 使用 | 集中处理“图形类型名 / SVG tag -> 具体 Shape”，统一参数与读回 | 各处重复按类型名构造会扩散第二处分派，不采用 |
| Visitor | `ShapeVisitor`、各图形的 `accept`；`ShapeSummaryVisitor`、`ShapeDetailVisitor`、`SvgShapeWriter` | tree/show/save 需要按具体类型输出不同内容，但不把显示或 SVG 格式知识放进领域对象 | 在显示和序列化层按 `type` / `instanceof` 分支会增加分派点，不采用 |
| Memento | `ShapePlacement`、`ShapeAttributeSnapshot`；具体命令创建并在 undo 时恢复 | 保存图形位置、父级、顺序和叶子旧属性，实现局部精确撤销 | 整文档快照会掩盖命令逆操作、增加内存成本，也无法表达恢复前后置条件，不采用 |
| Facade | `EditorCommandReceiver` 聚合 `EditorDocumentCommandReceiver`、`EditorShapeCommandReceiver`、`EditorViewCommandReceiver` 和共享 History；`Document` 聚合树与索引 | 给具体命令和上层流程提供稳定入口，隐藏能力分发与领域协作细节 | 让 Session 直接持有 Document、History 和 IO 会把应用编排推入 CLI，不采用 |
| Caretaker | `CommandHistory` | 管理 undo/redo 两栈和历史锁，只保存命令引用 | 把历史栈塞进 Document 会混淆聚合根与操作历史职责，不采用 |
| Adapter / Port | `Executor`、`CommandReceiver`、`InputReader` / `OutputWriter`、`SvgStorage`、`DirectoryListing` + `NodeDirectoryListing` | 隔离 CLI、Core、终端、文件与目录访问 | 层直接依赖具体类会破坏依赖方向，不采用 |
| Plugin Host | `SvgPlugin`、`PluginContext`、`PluginHost`、配置加载器 | 统一 A/B 装入、清单校验与失败回滚 | 在 main 里直接 `register` 绕过校验会破坏双装配一致性，不采用 |
| Template Method | `CommandContribution` 的 `createCommand`（固定流程：校验命令名、调用工厂、校验返回值为 `Command`）与抽象钩子 `buildCommand`；由 `CreateCommandContribution` 等具体贡献实现 | 所有命令贡献共享身份校验与失败语义，具体贡献只关心如何解析参数并构造命令 | 每个贡献各自实现 `createCommand` 会复制校验逻辑，且容易漏掉返回值检查，不采用；让基类持有命令工厂函数表会退化为按名字的大分支 |
| Decorator（行标签） | `TreeDecorator`（抽象类）、`TreeDecoratorRegistry`；`ModifiedStarDecorator` 与 `BoxTypeLabelDecorator` 为具体装饰器；`TreeDisplay` 按注册顺序拼接行尾标签 | 在不修改图形对象和 tree 显示主流程的前提下，为行追加标签（`*`、`(box)`），并支持多个标签叠加 | 修改 `ShapeSummaryVisitor` 内的字符串拼接会把所有标签规则堆进显示层，不采用；与经典包装式 Decorator 不同，这里不包装图形对象，而是向显示流程提供标签片段，因此更接近“可叠加的行标签扩展点”，与 VSCode 文件装饰的分析口径一致 |
| Strategy（属性处理器） | `AttributeHandler`（抽象类）、`AttributeCatalog`、`AttributeRegistry`；`BoxAttributeHandler` 为具体策略 | 同一个 `set` 命令按图形与属性选择不同的修改算法，内核只负责路由和撤销 | 在 `EditorShapeCommandReceiver` 中按图形类型写 `if` 会把插件语义拉回内核，不采用；多处理器同时命中时直接报 ambiguous 错误，而不是按优先级覆盖（见 ADR 0001） |

按名字分派集中在 Registry：命令名、图形类型名、属性处理器名、树装饰器名。Phase 2 角色名 `ShapeProvider` 对应 `ShapeContribution`。

## 4. 依赖方向与理由

```text
main -> cli + core + host + _builtin + _plugin
host -> protocol + core   （方式 A 装配可再依赖 _plugin）
cli  -> protocol
core -> protocol
_builtin -> protocol
_plugin  -> protocol
protocol -/-> cli | core | host | _builtin | _plugin | Node | DOM
```

理由：

- `protocol` 持有交换对象与扩展点契约；实现落在 `_builtin` / `_plugin`，运行时注册表在 `core`。
- `host` 负责装入与清单校验，不属于内核；加载器按模块字符串解析，不 import 具体插件包。
- `cli` / `core` 仍单向依赖 `protocol`；插件不得依赖 `core` / `host` / `_builtin` 内部。
- `main.ts` 是组合根：内置叶子 → 插件 activate → 内置 `g`（保证 box 认领 `data-kind`）。

## 5. 未来变化点与预留方式

| 变化点 | 状态 / 预留 |
|---|---|
| 图形类型扩展 | **已落地** `ShapeContribution` + `box`；可继续加 diamond/arrow 等插件 |
| 命令扩展 | **已落地** `CommandContribution` + `stats`/`dir` + PluginHost |
| 属性语义扩展 | **已落地** `AttributeHandler` |
| 树行标签 | **已落地** `TreeDecorator` |
| 配置装配 | **已落地** 方式 B（`plugins.config.json`） |
| SVG 保真度 / 新入口 / 渲染 | 仍隔离在 IO 与 Protocol，本阶段不扩展 |

## 6. 过程记录

### 6.1 开发策略：先建立行为基线，再重构架构

在提交 `2216dc4 docs: 补充项目交付说明` 之前，开发协作只使用 plan mode：先由 AI 制定并执行计划，按照 TDD 小步推进，由 AI 自行完成测试与实现，最终得到一个行为正确的完整 CLI 实现。这一阶段的首要目标是建立可运行、可验证的业务基线，初步要求AI划分了功能模块并运用了设计模式，但不是一次性追求理想的目录结构。

该提交之后，工作重点转向 refactor，人工Review代码。重构主要关注目录架构、依赖方向和代码可读性，并持续利用已有测试做回归：先在行为保持不变的前提下调整职责边界与目录，再由测试确认命令行为、文档状态、撤销/重做、SVG 读写和 CLI 交互没有被破坏。对每次结构改动都尽量保持提交范围单一，使问题可以定位和回退。

这种“先形成行为基线，再用测试保护持续重构”的过程，是本项目保证代码质量的信心来源。它让我们可以在已经确认功能正确的基础上改善架构，而不是用架构调整替代对业务行为的验证。

### 6.2 关键迭代

1. 最初以命令/图形数据联合类型搭建解析与输出骨架，随后重构为 `Command`、`UndoableCommand`、`Shape` 类层次，避免贫血模型和按类型到处分派。
2. 将错误与结果从联合类型改为运行时类层次，在 CLI 边界统一转换为 DTO，保证错误码和消息结构稳定。
3. 从单个文档类中抽出 `ShapeIndex` 与 `ShapeHierarchy`，分别负责身份/父子索引和有序树结构，降低聚合根膨胀风险。
4. 将演示执行器替换为真实 `EditorCommandReceiver + CommandHistory + Document` 链路，编辑命令开始真正修改文档。
5. 撤销采用命令内局部状态：结构操作保存 `ShapePlacement`，属性操作保存 `ShapeAttributeSnapshot`；恢复时校验父级、索引、重复 id 与祖先冲突。
6. tree/show 通过 Visitor 扩展，不把显示格式写进 Shape；save 复用 Visitor 生成 SVG 元素。
7. SVG read/save 接入后增加 IO 历史锁：`init`/`read` 清空历史，`save`/`canvas` 修改后锁定 undo/redo，下一次成功编辑重新解锁。
8. 收尾时发现 CLI 依赖 Core 中的 `Executor`，将其移到 `protocol`，恢复 `cli -> protocol` 的单向依赖。
9. 调整移动反馈：叶子图形输出绝对位置，容器输出增量；容器没有单一坐标，绝对位置反馈不适用于复合节点。
10. 增加 `scripts/e2e.mjs` 黑盒回归。脚本首次运行时发现提示符替换会误伤 `<file.svg>` 文本，以及 tree 行不是裸 id；据此改为只剥离行首提示符并使用前缀断言。
11. 拆分 CLI 主循环：Parser 负责输入分类，CommandSession 负责单次输入的反馈和继续/退出策略，CommandLoop 只负责提示与读取。未知执行异常不再被循环吞掉，而是交给组合根终止进程。
12. 拆分 Parser：Tokenizer 负责引号感知切词，CommandArguments 负责元数和类型校验，四类命令构造器负责具体对象创建，CommandDefinitionRegistry 集中命令名分派，CommandLineParser 收窄为统一入口。
13. 交付说明提交之后继续按目录职责重构 Parser：将词法和参数校验归入 `syntax`，将命令定义与注册归入 `commands/definition`，将文档、图形、显示命令构造器归入 `commands/CommandsParser`，解析结果独立到 `results`。
14. 重组 Protocol：命令按 `doc`、`shape`、`view`、`history`、`session` 语义族放置，撤销快照单独放入 `memento`；结果与错误分别拆出运行时类层次、具体结果、DTO 目录，Receiver 与执行端口独立成 `receivers`、`execution`。
15. 收窄 Core 协作边界：将编辑器上下文重命名并拆分为 `EditorCommandReceiver` 门面、文档/图形/显示三个能力 Receiver、`CommandExecutor` 和共享 `CommandHistory`；历史集合与历史锁归 History 管理，当前文档和文件路径归文档 Receiver 管理，CLI 不再依赖 Core 内部状态。

## 7. 一致性自查

- 依赖：`main -> cli + core + host + _builtin + _plugin`；`host/cli/core/_builtin/_plugin -> protocol`；`protocol` 不反向依赖。
- `npm run lint` 检查 `_builtin` / `_plugin` 分层导入。
- 扩展点调用只经 Catalog/Registry；显示与 SVG 写出经 Visitor。
- `CommandExecutor` 是成功命令入栈点；`CommandHistory` 独占撤销栈与历史锁。
- Phase 1 行为由 `final` 标记；Phase 2 文档与校验就绪后再打 `p2`（见 metrics 与双装配校验）。

## 8. 质量保证

```bash
npm test
npm run build
npm run lint
npm run test:e2e
npm run e2e
npm run e2e:phase2
npm run metrics
npm run verify:dual-assembly
```

覆盖：Protocol/Document/History/CLI、插件单测（含 `dir` 替身与真实 FS）、加载器失败路径与回滚、进程级 A/B 一致性、黑盒 E2E。

**Phase 2 黑盒验收**：`npm run e2e:phase2`（`tests/e2e/Phase2Acceptance.test.ts`，即 `p2` 验收）只经 `dist/main.js` 的进程边界运行，按 `phase_cli_2.md` 第 2–6 节的验收条目逐条断言：

| 验收段 | 覆盖内容 |
|---|---|
| §2 stats / dir | help 列出与空配置隐藏；统计规则与首次出现排序；stats 不入 undo；dir 无文档可用、排序与隐藏项、符号链接按 `[FILE]`、空目录、读取失败后继续、有文档时 undo 不变、未加载时 unknown command |
| §3 属性扩展点 | box 的 fill / label 各自是一个 undo 单元并可 undo/redo；普通矩形白名单与 `unknown attribute` |
| §4 box | `in` 子句与整体 move、嵌套、ungroup 拒绝；id 冲突整条失败不留容器；必要子部件不可删除/移入；保存 `data-kind="box"`，装插件读回、未装降级为 `g`；缺子部件与重复 id 的读入整体拒绝 |
| §5 树标签 | modified-star 的 init / 编辑 / undo 状态；保存后 undo 回保存点 `*` 消失；`(box) *` 并存 |
| §6 双装配与基线 | 四个会话的方式 A / B 逐字节一致且等于 `expected/`；Phase 1 会话禁用插件后等于 `final` 录制输出；加载器四条失败路径与重复注册（stderr，主程序继续）；配置结构非法 |

不在黑盒范围内、由单元/契约测试覆盖的项：处理器抛错回滚、多处理器 ambiguous（无法经 CLI 触发，见 `tests/core/attributes/`）；VSCode 扩展两项效果（另见 `vscode-extension/`）。

`dist/` 只由 `tests/support/buildDist.ts`（vitest `globalSetup`）构建一次，避免多个进程级测试文件并行构建时竞争写入。

---

## 9. Phase 2 扩展点清单

| 扩展点（角色名） | 接口 / 抽象类 | 职责 | 内核调用位置 | 已有实现 | 禁用可选扩展时 | 违约时报错（代码位置） |
|---|---|---|---|---|---|---|
| ShapeProvider（代码名 `ShapeContribution`） | 抽象类 `ShapeContribution` + `ShapeCatalog` | 按类型名创建；按 tag/`data-kind` 读回 | `CreateCommandContribution`；`SvgDocumentParser` → `ShapeRegistry.find` / `findForSvg` | `_builtin` 六种；`_plugin` `box` | 仅六种内置；带 `data-kind=box` 的 g 降级为普通 `GroupShape` | 类型名为空：`ShapeContribution` 构造器；直接重复注册：`ShapeRegistry` 的 `duplicate shape type`；经插件宿主重复注册：`duplicate registration: shapes/<name>`；未知类型：`CreateCommandContribution` 的 `unknown shape type` |
| Command | 抽象类 `CommandContribution`（模板方法 `createCommand` → `buildCommand`）+ `CommandCatalog` | 命令名、help、参数→Command | `CommandLineParser` → `CommandRegistry.find` | Phase 1 内置；`stats`、`dir` | help/执行无插件命令；`error: unknown command: <name>` | 名称/用法为空：`CommandContribution` 构造器；`buildCommand` 未返回 `Command`：`CommandContribution.createCommand`；直接重复注册：`duplicate command`；经插件宿主重复注册：`duplicate registration: commands/<name>`；执行期抛非协议异常：`CommandExecutor` 转 `command-failed` |
| AttributeHandler | 抽象类 `AttributeHandler` + `AttributeCatalog` | 图形+属性领域语义 | `EditorShapeCommandReceiver.setAttribute` / 撤销恢复 → `AttributeRegistry.find` | `BoxAttributeHandler`（`fill`/`label`） | 仅 Phase 1 白名单；`label` 等扩展属性执行期失败 | 多处理器命中：`AttributeRegistry` 的 ambiguous；直接重复注册：`duplicate attribute handler`；经插件宿主重复注册：`duplicate registration: attributes/<name>`；`apply` 抛错：`SetCommand.execute` 恢复快照，`CommandExecutor` 保证不入历史 |
| TreeDecorator | 抽象类 `TreeDecorator` + `TreeDecoratorCatalog` | tree 行尾标签；IO 后同步基线 | `TreeDisplay` 拼接；`EditorDocumentCommandReceiver.syncTreeDecorators` | `box-type-label`、`modified-star` | tree 输出与 Phase 1 逐字节一致 | 直接重复注册：`duplicate tree decorator`；经插件宿主重复注册：`duplicate registration: decorators/<name>` |

插件注册阶段的契约校验（清单与实际注册集合不一致、重复注册、模块缺失/无默认导出/激活失败）由 `PluginHost` / `PluginModuleLoader` 负责，见第 10 节。

插件以类实现扩展点，经 `SvgPlugin.activate(PluginContext)` 注册；不得依赖 `core`/`host` 内部。

## 10. 两种装配方式与配置格式

**共用路径**：`PluginHost.activate`（暂存 → `contributes` 集合校验 → commit）。

**方式 A（改代码）** — 默认启动：

```ts
// src/assembly/CodePluginInstaller.ts
await host.activate(new StatsCommandPlugin(), PluginContributes.of({ commands: ["stats"] }));
// … dir、box、modified-star
```

**方式 B（改配置）**：

```bash
node dist/main.js --config plugins.config.json
```

```json
{
  "plugins": [
    { "module": "./dist/_plugin/commands/StatsCommand" },
    { "module": "./dist/_plugin/commands/DirCommand" },
    { "module": "./dist/_plugin/shapes/BoxShape" },
    { "module": "./dist/_plugin/tree/ModifiedStarPlugin" }
  ]
}
```

- `enabled: false` 跳过；`options` 经 `PluginContext.getOptions()` 传入（如 dir 的 `directoryPath`）。
- 相对 `module` 以配置文件目录为基准；`package.json` 的 `contributes` 提供 `shapes`/`commands`/`attributes`/`decorators` 名称列表。
- 失败输出：`plugin not found` / `no default export` / `manifest mismatch` / `failed to activate` / `duplicate registration` / `invalid plugin config`；失败插件回滚，主程序继续。

证明材料：`docs/facts/dual-assembly-proof.md`；自动化 `npm run verify:dual-assembly`；transcript 在 `doc/transcript/`。

## 11. `dir` 与目录访问适配器

- 端口：`protocol/io/DirectoryListing`（只描述列出目录条目）。
- 适配器：`_plugin/commands/DirCommand/NodeDirectoryListing`（Node `fs`）。
- `DirCommand` 只依赖端口；测试可注入替身。真实 FS 与替身测试见 `tests/_plugin/commands/DirCommand/`。
- 排序：目录在前、文件在后，组内按 UTF-16 码元序（与区域设置无关，大写先于小写，`.` 先于字母）。
- **符号链接规则**：不跟随链接目标；`Dirent.isDirectory()` 为假的条目（含指向目录的符号链接）一律以 `[FILE]` 列出。
- 不接收参数；不读写文档、不入 undo 栈；读取失败返回 `error: cannot read directory: <path>`。

Adapter 角色对应：Client = `DirCommand`；Target = `DirectoryListing`；Adapter = `NodeDirectoryListing`；Adaptee = `node:fs/promises.readdir`。

这是 Adapter：插件命令面向稳定端口，文件系统细节留在适配器。

## 12. ADR 与指标

- ADR：[`docs/adr/`](../docs/adr/)（属性契约、box 降级、dirty 语义、清单校验时机、box 子部件 id 与结构不变量；以及分层与 `_builtin` / `protocol` 拆分、命令聚拢、图形贡献替代 `ShapeFactory`、扩展点抽象类、目录端口）。
- 迭代报告：[`iteration-report-phase2.md`](./iteration-report-phase2.md)（Phase 1 → Phase 2 的过程、架构对比图与指标变化）。
- Metrics：`npm run metrics` → [`docs/metrics/summary.md`](../docs/metrics/summary.md)（相对 `final`（终点为标签 `p2`，未创建时用 `HEAD`）的内核/装配/插件行数与圈复杂度增量，复杂度由 TypeScript AST 逐函数计算；含文件职责清单，VSCode 扩展单独列出；脚本生成、禁止手填）。

## 13. VSCode 扩展（第一部分）

源码位于 `vscode-extension/`。扩展只提供 VSCode 界面附加信息，不修改 SVG 文件名或
文件内容，也不实现完整 SVG 校验或图形预览。

安装与启动：

```bash
cd vscode-extension
npm install
npm run build
```

随后用 VSCode 打开 `vscode-extension/` 并按 F5，或执行：

```bash
code \
  --extensionDevelopmentPath="$PWD" \
  "$PWD/test-fixtures/workspace"
```

示例 SVG 为 [`vscode-extension/examples/example.svg`](../vscode-extension/examples/example.svg)。
Extension Development Host 中的文件标记、Outline 层级和源码定位效果如下：

![Explorer SVG 标记与原生 Outline](../docs/pj1-phase2-2/vscode-extension/outline-and-badge.png)

### 13.1 VSCode 与扩展的职责

VSCode 负责发现并启动扩展，管理 Explorer、编辑器与原生 Outline，在资源出现或文档
变化时调用扩展注册的 Provider，并依据 Provider 返回值渲染装饰与大纲。用户点击大纲
节点后，也由 VSCode 根据 `DocumentSymbol.selectionRange` 定位源码。

实现前在 Extension Development Host 中观察到：未注册 DocumentSymbol Provider 时原生
Outline 显示无信息；注册后，VSCode 会按 `DocumentSymbol.children` 渲染层级，按
`selectionRange` 处理点击定位，并在活动文档文本变化后再次调用 Provider。因此本任务
接入原生 Provider，而不是另建自定义 Tree View。

本扩展负责判断普通 `.svg` 文件、解析当前文本、生成元素层级与源码偏移，并把结果适配
为 VSCode 的 `FileDecoration` 与 `DocumentSymbol`。扩展入口在激活时向 VSCode 注册
两个 Provider：

```ts
context.subscriptions.push(
  vscode.window.registerFileDecorationProvider(fileDecorationProvider),
  vscode.languages.registerDocumentSymbolProvider("*", documentSymbolProvider),
);
```

`SvgDocumentSymbolProvider` 会再次检查扩展名，因此宽泛的 `"*"` 语言选择器不会使普通
文件产生 SVG 大纲。注册后由 VSCode 主动回调，扩展不轮询 Explorer 或编辑器：

```text
文件资源
  -> VSCode Explorer
  -> SvgFileDecorationProvider.provideFileDecoration()
  -> 返回 { badge: "[]", tooltip: "SVG 文件" }
  -> VSCode 渲染标记

打开或编辑 SVG
  -> VSCode Outline
  -> SvgDocumentSymbolProvider.provideDocumentSymbols()
  -> SvgOutlineParser.parse()
  -> SvgDocumentNode.accept(SvgOutlineVisitor)
  -> 转换为 vscode.DocumentSymbol
  -> VSCode 渲染大纲并处理点击定位
```

### 13.2 文件装饰、Decorator 与 Adapter

文件装饰与经典 Decorator 的共同点是“不修改原对象内容，却为调用方呈现额外信息”。
但二者对象关系和调用方式不同：

| 角度 | 经典 Decorator | VSCode 文件装饰 |
|---|---|---|
| 对象组合 | 装饰器持有被装饰对象 | Provider 不持有 Explorer 文件对象 |
| 接口关系 | 装饰器通常实现与被装饰对象相同的接口 | Provider 实现独立的 `FileDecorationProvider` |
| 调用方式 | 调用进入装饰器后委托给内部对象 | VSCode 回调 Provider，扩展只返回装饰元数据 |
| 渲染责任 | 装饰器参与原对象调用链 | Explorer 决定何时查询、如何渲染和刷新 |
| 行为影响 | 可改变对象行为 | 只增加界面标记，不改变文件名或文件内容 |

因此这里不应称为经典 Decorator，更准确的分类是“VSCode 扩展点 + Provider 回调 +
数据适配”。

Adapter 角色对应如下：

- `SvgFileDecorationProvider` 将扩展的普通 SVG 文件判断适配为 VSCode
  `FileDecorationProvider` 契约。
- `SvgDocumentSymbolProvider` 将扩展树和 `SvgSymbolDto` 适配为
  `vscode.DocumentSymbol`。
- Parser、节点模型和 Visitor 不依赖 `vscode` 模块，可在普通 Node 单元测试中运行；
  VSCode 类型只出现在 Provider 适配边界。

### 13.3 SVG 树模型与 Visitor

`SvgNode` 是统一节点入口，`SvgDocumentNode` 持有唯一根元素，`SvgElementNode` 封装
标签名、id、源码范围和子元素。容器与叶子使用同一套访问方式，由子元素集合表达层级，
避免调用方按标签名散落分支。

`SvgNodeVisitor<T>` 与节点的 `accept` 构成双分派，`SvgOutlineVisitor` 递归生成中立
的 `SvgSymbolDto` 后，再由 Provider 转换成 VSCode 类型。这样树结构保持稳定，“遍历
后做什么”可以独立扩展。当前规模下只有一个 Outline 访问者，直接在 Provider 中递归
也能实现，但会把解析模型与 VSCode 类型耦合，也不便于分离单元测试。

### 13.4 Phase 1 代码复用评估

| Phase 1 模块 | 能否直接复用 | 原因 |
|---|---|---|
| `CommandLineParser`、命令 Tokenizer | 否 | 解析 CLI 命令文本，不解析 SVG XML |
| `SvgDocumentParser` | 否 | 只保留六种可编辑图形；会为无 id 元素分配 id；不保留源码偏移；损坏 XML 直接抛错 |
| `Shape`、`GroupShape` | 否 | 包含移动、缩放、样式等编辑语义，只接受受支持图形；Outline 需要展示任意 SVG 标签 |
| `ShapeFactory` | 否 | 按可编辑图形类型创建对象，没有通用 XML 节点和源码范围 |
| `ShapeVisitor` | 否 | 接口方法绑定具体图形类，增加任意 SVG 标签会持续扩张接口 |
| `fast-xml-parser` 配置 | 部分思路可参考 | 通用 XML 解析能力可借鉴，但现有配置丢弃源码位置和未知标签，不满足定位与容错要求 |

最终使用独立的 `SvgOutlineParser`，保留任意标签名、完整节点偏移和开始标签选择范围，
跳过注释、声明、DOCTYPE、CDATA，并在 XML 不完整时返回空结果而不让扩展崩溃。CLI 与
VSCode 扩展共享 Composite + Visitor 的设计思路，但没有强行共享具体类，因为 CLI 关注
可编辑图形，VSCode Outline 关注任意 SVG 语法元素及其源码位置。

### 13.5 验证证据

- Explorer 中 `example.svg` 显示 `[]`，普通文本文件和名为 `folder.svg` 的目录无标记。
- Outline 展示 `svg -> g#flowchart -> rect#start/text` 的嵌套层级。
- 点击 `rect#start` 后定位到对应开始标签源码。
- Parser 单元测试覆盖嵌套、id、无 id、自闭合标签、注释、CDATA、属性值中的伪 `id`
  文本和损坏 XML。
- VSCode Extension Host 集成测试验证文件装饰、目录过滤、大纲层级、编辑后更新与
  异常输入。

更详细的过程分析见
[`docs/pj1-phase2-2/vscode-extension/analysis.md`](../docs/pj1-phase2-2/vscode-extension/analysis.md)，
扩展自身的安装与故障排查步骤见
[`vscode-extension/README.md`](../vscode-extension/README.md)。
