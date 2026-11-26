# 插件宿主与双装配

- 扩展点注册唯一路径：`PluginHost.activate` → 暂存 → `contributes` 集合校验 → commit；任一环节失败整体回滚。
- 方式 A：`src/assembly/CodePluginInstaller` 构造插件实例并交给 `PluginHost`；方式 B：`plugins.config.json` + 模块字符串加载。
- `src/host` 不属 `core`，也不含任何具体插件导入；具体插件只出现在 `src/assembly`（方式 A）与配置文件（方式 B）。
- `src/assembly/BuiltinContributionInstaller` 装配内置命令/图形。顺序：内置叶子图形 → 插件 → 内置 `g`（box 须先于普通 group 认领 `data-kind`）。
- `--config <path>` 启用方式 B；缺省为方式 A。
- 插件包隔离：`_plugin` 下每个包只可依赖 `protocol` 与自身包目录；跨插件依赖由 `npm run lint` 拒绝。
- 模块加载器沿目录向上查找最近的 `package.json` 读取 `contributes`（入口可在子目录）。
- 契约基类：`CommandContribution`、`ShapeContribution`、`AttributeHandler`、`TreeDecorator` 均为抽象类/接口，扩展点实现必须继承或实现之；违约时由基类/注册表抛错（见 `doc/README.md` §9）。
