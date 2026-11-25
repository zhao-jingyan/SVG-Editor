import type { CommandCatalog } from "../protocol/plugins/CommandCatalog";
import type { CommandRegistrar } from "../protocol/plugins/CommandRegistrar";
import type { CommandRegistration } from "../protocol/plugins/CommandRegistration";
import { PluginRegistrationError } from "./PluginRegistrationError";

export class StagedCommandRegistrar implements CommandRegistrar {
  private readonly staged: CommandRegistration[] = [];
  private active: boolean = true;

  public constructor(private readonly liveCatalog: CommandCatalog) {}

  public register(registration: CommandRegistration): void {
    this.requireActive();

    const commandName = registration.getName();

    if (
      this.liveCatalog.find(commandName) !== undefined ||
      this.staged.some((candidate) => candidate.getName() === commandName)
    ) {
      throw new PluginRegistrationError("commands", commandName);
    }

    this.staged.push(registration);
  }

  public commit(target: CommandRegistrar): void {
    this.requireActive();

    for (const registration of this.staged) {
      target.register(registration);
    }

    this.close();
  }

  public close(): void {
    this.active = false;
  }

  private requireActive(): void {
    if (!this.active) {
      throw new Error("plugin context is no longer active");
    }
  }
}
