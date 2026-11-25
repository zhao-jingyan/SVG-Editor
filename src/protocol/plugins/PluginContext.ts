import type { CommandRegistrar } from "./CommandRegistrar";

export interface PluginContext {
  readonly commands: CommandRegistrar;
}
