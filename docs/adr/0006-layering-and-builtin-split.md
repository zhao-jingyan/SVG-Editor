# ADR 0006：分层边界与 `_builtin` / `protocol` 拆分

## 状态

已采纳

## 背景

Phase 1 的 `protocol` 同时承载了契约（`Command`、`Shape`、`Result`）和具体实现（内置命令类、六种图形类）。这导致两个问题：

- 内核的“契约”与“实现”混在一个目录里，无法区分哪些类型是插件可以依赖的稳定面，哪些是内置实现；
- 插件要扩展命令或图形时，没有地方放置“只依赖契约、不依赖内核实现”的代码，也无法用依赖规则证明插件没有偷用内核内部。

Phase 2 需要把插件装入过程与内置能力放到同一套规则下，同时让双装配（方式 A/B）的内核保持不变。

## 决策

1. **目录职责固定**：
   - `protocol`：只放契约（命令基类与贡献 API、图形领域模型、接收者接口、IO 端口、结果/错误模型、扩展点接口）。不得依赖 `cli`、`core`、`host`、`_builtin`、`_plugin`、Node 或 DOM。
   - `core`：执行器、文档状态、运行时注册表。只依赖 `protocol`。
   - `cli`：输入输出、终端适配、文本到命令对象的解析。只依赖 `protocol`。
   - `_builtin`：内置命令与内置图形贡献，只依赖 `protocol` 与自身。
   - `_plugin`：可选插件包，只依赖 `protocol` 与自身包（允许 `node:` 适配器）。
   - `host`：插件宿主与配置加载，只依赖 `protocol` + `core`，不得 import 任何具体插件或内置贡献。
   - `assembly`：组合根侧的具体装配（`BuiltinContributionInstaller`、`CodePluginInstaller`）。
   - `main.ts`：组合根，装配 CLI、Core、host、assembly 与方式 A/B 的选择。
2. **内置命令与图形贡献迁出契约**：Phase 1 位于 `protocol/commands` 的内置命令迁入 `_builtin/commands/`（提交 `1438f1b`、`4cf6d71`），内置图形的创建与读回贡献位于 `_builtin/shapes/`。`protocol` 中不再有命令实现类与图形贡献；`protocol/shapes/concrete/` 保留的六种图形属于领域模型，不是贡献。
3. **内置包只导出贡献，不自注册**：`_builtin` 中的每个 `*Contribution` 只提供 `create()` 工厂；注册清单统一由 `assembly/BuiltinContributionInstaller` 写入注册表，再由 `main` 调用。
4. **宿主与装配分离**：方式 A 的插件清单（`CodePluginInstaller`）与内置装配移出 `host`（提交 `b546033`）。`host` 只依赖 `SvgPlugin` 接口、`PluginContext` 与 `core` 的运行时注册表，不知道任何具体插件名。
5. **依赖方向由 lint 强制**：`scripts/lint-layer-boundaries.mjs` 检查分层导入，并对每个 `_plugin` 包做隔离，违规时 `npm run lint` 失败。

固定依赖方向：`cli → protocol`、`core → protocol`、`_builtin → protocol`、`_plugin → protocol`、`host → protocol + core`、`assembly → host + core + protocol + _builtin + _plugin`、`main → cli + core + host + assembly`。

## 后果

- 新增内置命令或图形只改 `_builtin` 与 `BuiltinContributionInstaller`，不改 `protocol`。
- 新增插件只需实现 `SvgPlugin` 并进入方式 A 清单或配置文件，不需要修改 `host` 或 `core`。
- 装配顺序成为可见的约束：叶子图形先于插件，插件先于普通 `g`（见 ADR 0002）。这些顺序集中在 `assembly` 与 `main`，而不是散落在解析器中。
- 代价：目录数量增加；测试需要一套镜像组合根注册清单的夹具（`tests/support/createBuiltinCatalog.ts`、`createBuiltinShapeCatalog.ts`），两者需要同步维护。

## 替代方案

- **内置命令留在 `protocol`（Phase 1 形态）**：契约与实现混杂，插件无法判断哪些类型是稳定面，不采用。
- **`_builtin` 自注册（模块加载时写入全局表）**：注册时机隐式，无法保证 `box` 先于普通 `g`，也无法用测试替换清单，不采用。
- **`host` 直接注册内置与插件**：宿主耦合具体实现，方式 A 与方式 B 的一致性无法保证，不采用。
- **仅靠文档约定、不做 lint**：违规只能靠人工审查发现，不采用。

## 代码锚点

- 分层规则：`scripts/lint-layer-boundaries.mjs`
- 内置装配：`src/assembly/BuiltinContributionInstaller.ts`
- 插件清单：`src/assembly/CodePluginInstaller.ts`
- 组合根：`src/main.ts`
- 宿主：`src/host/PluginHost.ts`
- 事实文档：`docs/facts/cli-core-boundary.md`
