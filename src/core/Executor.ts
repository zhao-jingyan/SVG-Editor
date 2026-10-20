import type { Command } from "../protocol/Command";
import type { CommandResult } from "../protocol/results/CommandResult";

export interface Executor {
  execute(command: Command): Promise<CommandResult>;
}
