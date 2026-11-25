import type { CommandRegistration } from "./CommandRegistration";

export interface CommandCatalog {
  find(commandName: string): CommandRegistration | undefined;

  getRegistrations(): readonly CommandRegistration[];
}
