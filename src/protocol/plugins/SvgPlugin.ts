import type { PluginContext } from "./PluginContext";

/**
 * 可装入的 SVG 编辑器插件。
 * 默认导出为类或实例；宿主经 activate 走统一注册路径。
 */
export interface SvgPlugin {
  readonly name: string;

  activate(context: PluginContext): void | Promise<void>;
}
