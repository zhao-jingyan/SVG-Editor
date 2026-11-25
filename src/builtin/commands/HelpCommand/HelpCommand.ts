import { Command } from "@/protocol/commands/Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";

export class HelpCommand extends Command {
  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.help();
  }
}
