# 插件运行时

> Canonical owner：`src/plugins`

## 范围

- 本文档涵盖：插件激活、Command 暂存注册、重复检测、激活失败处理和上下文关闭。
- 本文档不涵盖：命令文本解析、具体命令执行、配置加载器、模块解析或其他三个扩展点。

## 核心规则

- `SvgPlugin` 只暴露稳定名称和 `activate(context)`；激活允许同步或异步完成。
- 插件通过 `PluginContext` 注册贡献，当前只提供 `commands` 注册器。
- 每个插件使用独立暂存区。激活期间不得直接修改 live command registry。
- 重复命令名同时检查 live registry 和当前插件暂存区，错误消息为
  `duplicate registration: commands/<name>`。
- 激活成功后才按注册顺序提交全部命令；提交后关闭上下文。
- 激活抛错或注册失败时丢弃整个暂存区，不留下部分命令。
- 激活结束后插件继续使用旧上下文注册属于错误，必须抛出
  `plugin context is no longer active`。
- `PluginActivationError` 保存插件名和失败原因；内置命令插件失败属于不可恢复启动错误。

## 设计模式

- Command：插件注册的命令仍构造协议层 `Command` 对象，执行链不感知插件。
- Facade：`PluginContext` 对插件隐藏暂存注册和具体注册表实现。
- Transaction：`StagedCommandRegistrar` 先暂存后提交，失败时整体丢弃。

## 相关代码

- 生命周期：[PluginHost](PluginHost.ts)。
- 暂存注册：[StagedCommandRegistrar](StagedCommandRegistrar.ts)。
- 激活上下文：[PluginActivationContext](PluginActivationContext.ts)。
- 错误：[PluginActivationError](PluginActivationError.ts)、[PluginRegistrationError](PluginRegistrationError.ts)。
- 回归：[PluginHost.test.ts](../../tests/plugins/PluginHost.test.ts)。
