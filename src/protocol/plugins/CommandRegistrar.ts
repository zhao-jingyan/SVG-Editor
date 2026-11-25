import type { CommandRegistration } from "./CommandRegistration";

export interface CommandRegistrar {
  register(registration: CommandRegistration): void;
}
