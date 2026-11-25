import { Command } from "@/protocol/commands/Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import { CommandExitResult } from "@/protocol/results/outcomes/CommandExitResult";
import type { CommandResult } from "@/protocol/results/CommandResult";

export class ExitCommand extends Command {
  public async execute(_receiver: CommandReceiver): Promise<CommandResult> {
    return new CommandExitResult();
  }
}
