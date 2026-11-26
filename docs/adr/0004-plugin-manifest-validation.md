# ADR 0004：配置清单校验时机与回滚

## 状态

已采纳

## 背景

方式 A/B 须共用同一注册路径。配置加载可能遇到缺模块、坏导出、清单与实装不一致、activate 抛错、重复名。须在失败时不影响已成功插件，并继续启动。

## 决策

1. **唯一路径**：`PluginHost.activate` = 暂存注册 → 比对 `contributes` 名称集合 → `commit`；方式 A 的 `CodePluginInstaller` 与方式 B 的 `loadPluginsFromConfig` 都经此路径。
2. **校验时机**：在 `activate` 返回之后、`commit` 之前比对声明与暂存名集合（顺序无关）。不一致则丢弃暂存并打印  
   `error: plugin manifest mismatch: <name> (declared: …, registered: …)`。
3. **重复名**：暂存阶段相对正式表 + 本插件暂存查重；冲突抛 `DuplicateRegistrationError`，格式化为  
   `error: duplicate registration: <category>/<name>`，不 commit。
4. **失败隔离**：任一插件失败只 `discard` 本插件暂存；已 commit 的插件保留；加载器继续下一项。
5. **配置非法**：结构/JSON 错误只报 `error: invalid plugin config`，以已注册的内置能力启动（无可选插件）。
6. **加载器位置**：`src/host`，不属于 `core`；模块名按字符串解析，无具体插件硬编码。

## 后果

- 清单成为强制契约，避免“注册了但未声明”的漂移。
- 方式 B 可在缺插件时降级启动，利于演示与排障。
- 插件作者须保持 `package.json` contributes 与 `activate` 一致。

## 代码锚点

- 宿主：`src/host/PluginHost.ts`、`PluginActivationContext.ts`
- 加载：`src/host/loadPluginsFromConfig.ts`、`PluginModuleLoader.ts`
- 契约：`src/protocol/plugins/SvgPlugin.ts`、`PluginContributes.ts`
