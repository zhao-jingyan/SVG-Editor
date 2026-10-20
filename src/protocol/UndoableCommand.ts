import { Command } from "./Command";
import type { CommandContext } from "./CommandContext";
import type { CommandResult } from "./CommandResult";
import { CommandErrorCode } from "./errors/CommandErrorCode";
import { CommandExecutionError } from "./errors/CommandExecutionError";

export abstract class UndoableCommand extends Command {
  public async undo(_context: CommandContext): Promise<CommandResult> {
    return {
      type: "error",
      error: new CommandExecutionError(
        CommandErrorCode.CommandNotImplemented,
        `undo is not implemented for command: ${this.type}`,
      ).toCommandErrorDto(),
    };
  }
}
