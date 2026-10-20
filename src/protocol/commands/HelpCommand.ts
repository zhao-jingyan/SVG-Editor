import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";

export class HelpCommand extends Command {
  public readonly type = "help";

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.help();
  }
}
