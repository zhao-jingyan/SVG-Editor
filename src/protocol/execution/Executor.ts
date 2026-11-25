import type { Command } from "@/protocol/commands/_common/Command";
import type { CommandResult } from "@/protocol/results/CommandResult";

export interface Executor {
  execute(command: Command): Promise<CommandResult>;
}
