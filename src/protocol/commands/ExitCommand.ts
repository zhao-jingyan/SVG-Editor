import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";

export class ExitCommand extends Command {
  public readonly type = "exit";

  public async execute(_context: CommandContext): Promise<CommandResult> {
    return { type: "exit" };
  }
}
