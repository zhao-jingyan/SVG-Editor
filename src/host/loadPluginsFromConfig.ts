import { dirname, resolve } from "node:path";
import type { PluginHost } from "./PluginHost";
import { PluginConfigLoader } from "./PluginConfigLoader";
import { PluginModuleLoader } from "./PluginModuleLoader";

export type ConfigLoadReporter = (message: string) => void;

/**
 * 方式 B：读配置、按序加载模块并经 PluginHost.activate 注册。
 * 任一条失败打印 error: 后继续；配置非法则仅报错并跳过全部插件。
 */
export async function loadPluginsFromConfig(
  host: PluginHost,
  configPath: string,
  reportError: ConfigLoadReporter = (message) => {
    console.error(message);
  },
  configLoader: PluginConfigLoader = new PluginConfigLoader(),
  moduleLoader: PluginModuleLoader = new PluginModuleLoader(),
): Promise<void> {
  const absoluteConfigPath = resolve(configPath);
  let config;
  try {
    config = configLoader.loadFromFile(absoluteConfigPath);
  } catch {
    reportError("error: invalid plugin config");
    return;
  }

  const basedir = dirname(absoluteConfigPath);

  for (const entry of config.getPlugins()) {
    if (!entry.isEnabled()) {
      continue;
    }

    const moduleId = entry.getModuleId();
    const loaded = moduleLoader.load(moduleId, basedir);

    if (!loaded.ok) {
      if (loaded.kind === "not_found") {
        reportError(`error: plugin not found: ${moduleId}`);
      } else if (loaded.kind === "no_default_export") {
        reportError(`error: plugin has no default export: ${moduleId}`);
      } else {
        reportError(
          `error: plugin failed to activate: ${moduleId} (${loaded.reason ?? "load failed"})`,
        );
      }
      continue;
    }

    await host.activate(loaded.plugin, loaded.contributes, entry.getOptions());
  }
}
