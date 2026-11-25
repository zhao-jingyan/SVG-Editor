import type { PluginContext } from "./PluginContext";

export interface SvgPlugin {
  /** 插件稳定名称，用于激活错误诊断。 */
  readonly name: string;

  /** 插件只允许在激活期间注册贡献。 */
  activate(context: PluginContext): void | Promise<void>;
}
