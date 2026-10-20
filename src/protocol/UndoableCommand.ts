import { Command } from "./Command";
import type { CommandContext } from "./CommandContext";
import type { CommandResult } from "./CommandResult";

export abstract class UndoableCommand extends Command {
  public async undo(_context: CommandContext): Promise<CommandResult> {
    return {
      type: "error",
      error: {
        code: "command-not-implemented",
        message: `undo is not implemented for command: ${this.type}`,
      },
    };
  }
}
