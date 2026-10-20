import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";

export class RedoCommand extends Command {
  public readonly type = "redo";

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.redo();
  }
}
