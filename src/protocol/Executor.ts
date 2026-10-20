import type { Command } from "./Command";
import type { CommandResult } from "./results/CommandResult";

export interface Executor {
  execute(command: Command): Promise<CommandResult>;
}
