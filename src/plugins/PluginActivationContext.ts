import type { CommandRegistrar } from "../protocol/plugins/CommandRegistrar";
import type { PluginContext } from "../protocol/plugins/PluginContext";

export class PluginActivationContext implements PluginContext {
  private readonly commandRegistrar: CommandRegistrar;

  public constructor(commands: CommandRegistrar) {
    this.commandRegistrar = commands;
  }

  public get commands(): CommandRegistrar {
    return this.commandRegistrar;
  }
}
