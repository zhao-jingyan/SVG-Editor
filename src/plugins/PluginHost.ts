import type { SvgPlugin } from "../protocol/plugins/SvgPlugin";
import { PluginActivationContext } from "./PluginActivationContext";
import { PluginActivationError } from "./PluginActivationError";
import type { PluginRegistrationServices } from "./PluginRegistrationServices";
import { StagedCommandRegistrar } from "./StagedCommandRegistrar";

export class PluginHost {
  public constructor(
    private readonly services: PluginRegistrationServices,
  ) {}

  public async activate(plugin: SvgPlugin): Promise<void> {
    if (plugin.name.trim().length === 0) {
      throw new Error("plugin name must not be empty");
    }

    const stagedCommands = new StagedCommandRegistrar(this.services.commands);
    const context = new PluginActivationContext(stagedCommands);

    try {
      await plugin.activate(context);
      stagedCommands.commit(this.services.commands);
    } catch (error: unknown) {
      throw new PluginActivationError(plugin.name, error);
    } finally {
      stagedCommands.close();
    }
  }

  public async activateAll(plugins: readonly SvgPlugin[]): Promise<void> {
    for (const plugin of plugins) {
      await this.activate(plugin);
    }
  }
}
