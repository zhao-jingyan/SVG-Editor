# 整合 Command 贡献对象

## 目标

- 用 `CommandContribution` 统一提供命令名、usage、help 与 Command 工厂。
- 引入只读 `CommandCatalog`；Core 用 `CommandRegistry` 实现并注册内置贡献。
- `CommandLineParser` / `HelpText` 共享同一目录，删除封闭的 `CommandType`。

## 分步提交

1. Protocol：`CommandContribution`、`CommandHelp`、`CommandParameters`、`CommandCatalog`。
2. Core 内置目录接线：Registry、Builtin 贡献、Parser/Help/main 组装。
3. 移除 `CommandType` 与旧 CLI 注册表，更新测试与文档。

## 验证

- `npm test`
- `npm run build`
