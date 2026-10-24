import { Command } from "../Command";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class HelpCommand extends Command {
  public readonly type = "help";

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.help();
  }
}
