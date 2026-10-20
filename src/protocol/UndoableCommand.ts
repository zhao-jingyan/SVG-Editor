import { Command } from "./Command";
import type { CommandContext } from "./CommandContext";
import { CommandErrorCode } from "./errors/CommandErrorCode";
import { CommandExecutionError } from "./errors/CommandExecutionError";
import { CommandErrorResult } from "./results/CommandErrorResult";
import type { CommandResult } from "./results/CommandResult";

export abstract class UndoableCommand extends Command {
  public async undo(_context: CommandContext): Promise<CommandResult> {
    return new CommandErrorResult(
      new CommandExecutionError(
        CommandErrorCode.CommandNotImplemented,
        `undo is not implemented for command: ${this.type}`,
      ),
    );
  }
}
