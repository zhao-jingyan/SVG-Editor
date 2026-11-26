# 方式 B 插件装配（依赖 plan38–41）

## 目标

- protocol：`SvgPlugin` / `PluginContext` / `PluginContributes`
- host：`PluginHost`（暂存→清单校验→commit）、`PluginModuleLoader`、`PluginConfigLoader`、`loadPluginsFromConfig`
- 方式 A：`CodePluginInstaller`（`src/assembly`）；方式 B：`--config plugins.config.json`
- 插件默认导出：stats / dir / box / modified-star；`package.json` contributes
- 内置叶子图形先注册，插件后，最后注册 `g`（保证 box 认领 `data-kind`）

## 失败契约

| 失败 | 输出 |
|---|---|
| 模块找不到 | `error: plugin not found: <module>` |
| 无默认导出 | `error: plugin has no default export: <module>` |
| 清单不一致 | `error: plugin manifest mismatch: <name> (declared: …, registered: …)` |
| activate 抛错 | `error: plugin failed to activate: <name> (<reason>)` |
| 重复注册 | `error: duplicate registration: <category>/<name>` |
| 配置非法 | `error: invalid plugin config` |

失败后撤销该插件暂存，继续启动。

## 完成状态

- 已完成。
