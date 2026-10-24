import { Command } from "../Command";
import type { CommandReceiver } from "../../CommandReceiver";
import { CommandExitResult } from "../../results/outcomes/CommandExitResult";
import type { CommandResult } from "../../results/CommandResult";

export class ExitCommand extends Command {
  public readonly type = "exit";

  public async execute(_receiver: CommandReceiver): Promise<CommandResult> {
    return new CommandExitResult();
  }
}
