# 插件生命周期与 Command 扩展点

## 目标

- 建立 `SvgPlugin`、`PluginContext` 和 Command 注册 SPI。
- 通过暂存注册实现重复检测、整插件回滚和激活后上下文失效。
- 将现有全部命令迁移到内置命令插件。
- 由已注册命令动态生成 `help`，保持原有输出逐字节不变。

## 边界

- 本阶段只开放 Command 扩展点。
- 不实现 `stats`、`dir`、配置加载器或其他三个扩展点。
- 不修改 `Command`、执行器、Graph/Document、SVG IO、tree/show 或历史语义。

## 公共接口

- `SvgPlugin` 提供稳定名称和可异步的 `activate`。
- `PluginContext` 当前只暴露 `commands`。
- `CommandRegistration` 封装命令名、usage、可选 help 和命令构造行为。
- `CommandCatalog` 提供命令查找和按注册顺序读取。

## 运行时

- 每个插件使用独立 `StagedCommandRegistrar`，激活期间不修改 live registry。
- 重复名称同时检查 live catalog 和当前暂存区。
- 激活成功后按原顺序提交，失败则丢弃暂存区。
- 激活结束或失败后暂存上下文失效。
- `PluginActivationError` 保存插件名和失败原因，供后续加载器转换为用户提示。

## 内置装配

- `BuiltinCommandPlugin` 按现有顺序注册全部命令。
- `front` 注册合并 help，`back` 只注册解析定义。
- `main.ts` 先激活插件，再构造 Parser、HelpText、Receiver、Executor 和 Session。

## 验证

- 注册、查找、重复检测、同步/异步激活、回滚和上下文失效测试。
- Parser 全部命令回归、精确 help 文本、未知命令、Phase 1 端到端会话。
- 运行 `npm test` 和 `npm run build`。
