import type { CommandCatalog } from "../protocol/plugins/CommandCatalog";
import type { CommandRegistrar } from "../protocol/plugins/CommandRegistrar";

export interface PluginRegistrationServices {
  readonly commands: CommandCatalog & CommandRegistrar;
}
