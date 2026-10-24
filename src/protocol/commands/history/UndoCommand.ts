import { Command } from "../Command";
import type { CommandContext } from "../../CommandContext";
import type { CommandResult } from "../../results/CommandResult";

export class UndoCommand extends Command {
  public readonly type = "undo";

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.undo();
  }
}
