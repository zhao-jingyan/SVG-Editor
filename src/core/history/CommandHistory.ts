import type { CommandContext } from "../../protocol/CommandContext";
import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../../protocol/errors/command/CommandExecutionError";
import { CommandErrorResult } from "../../protocol/results/outcomes/CommandErrorResult";
import type { CommandResult } from "../../protocol/results/CommandResult";
import type { UndoableCommand } from "../../protocol/commands/UndoableCommand";

export class CommandHistory {
  private readonly undoStack: UndoableCommand[] = [];
  private readonly redoStack: UndoableCommand[] = [];

  public record(command: UndoableCommand): void {
    this.undoStack.push(command);
    this.redoStack.length = 0;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public async undo(context: CommandContext): Promise<CommandResult> {
    const command = this.undoStack[this.undoStack.length - 1];

    if (command === undefined) {
      return this.unavailable("no command to undo");
    }

    const result = await command.undo(context);

    if (!result.isSuccess()) {
      return result;
    }

    this.undoStack.pop();
    this.redoStack.push(command);
    return result;
  }

  public async redo(context: CommandContext): Promise<CommandResult> {
    const command = this.redoStack[this.redoStack.length - 1];

    if (command === undefined) {
      return this.unavailable("no command to redo");
    }

    const result = await command.execute(context);

    if (!result.isSuccess()) {
      return result;
    }

    this.redoStack.pop();
    this.undoStack.push(command);
    return result;
  }

  public clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }

  private unavailable(message: string): CommandResult {
    return new CommandErrorResult(
      new CommandExecutionError(CommandErrorCode.HistoryUnavailable, message),
    );
  }
}
