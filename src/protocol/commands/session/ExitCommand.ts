import { Command } from "../Command";
import type { CommandContext } from "../../CommandContext";
import { CommandExitResult } from "../../results/outcomes/CommandExitResult";
import type { CommandResult } from "../../results/CommandResult";

export class ExitCommand extends Command {
  public readonly type = "exit";

  public async execute(_context: CommandContext): Promise<CommandResult> {
    return new CommandExitResult();
  }
}
