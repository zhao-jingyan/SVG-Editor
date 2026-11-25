# 插件宿主与双装配

- 扩展点注册唯一路径：`PluginHost.activate` → 暂存 → `contributes` 集合校验 → commit。
- 方式 A：`activateDefaultPlugins` 硬编码插件实例；方式 B：`plugins.config.json` + 模块字符串加载。
- 加载器在 `src/host`，不属 `core`；不得硬编码具体插件包。
- 装配顺序：内置叶子图形 → 插件 → 内置 `g`（box 须先于普通 group）。
- `--config <path>` 启用方式 B；缺省为方式 A。
