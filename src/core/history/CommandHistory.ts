import type { CommandReceiver } from "../../protocol/receivers/CommandReceiver";
import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../protocol/errors/ProtocolError";
import { CommandErrorResult } from "../../protocol/results/outcomes/CommandErrorResult";
import type { CommandResult } from "../../protocol/results/CommandResult";
import type { UndoableCommand } from "../../protocol/commands/UndoableCommand";

export class CommandHistory {
  private readonly undoStack: UndoableCommand[] = [];
  private readonly redoStack: UndoableCommand[] = [];
  private locked: boolean = false;

  public record(command: UndoableCommand): void {
    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.locked = false;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public async undo(receiver: CommandReceiver): Promise<CommandResult> {
    if (this.locked) {
      return this.unavailable("undo not allowed after io command");
    }

    const command = this.undoStack[this.undoStack.length - 1];

    if (command === undefined) {
      return this.unavailable("no command to undo");
    }

    const result = await command.undo(receiver);

    if (!result.isSuccess()) {
      return result;
    }

    this.undoStack.pop();
    this.redoStack.push(command);
    return result;
  }

  public async redo(receiver: CommandReceiver): Promise<CommandResult> {
    if (this.locked) {
      return this.unavailable("undo not allowed after io command");
    }

    const command = this.redoStack[this.redoStack.length - 1];

    if (command === undefined) {
      return this.unavailable("no command to redo");
    }

    const result = await command.execute(receiver);

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

  public lock(): void {
    this.locked = true;
  }

  private unavailable(message: string): CommandResult {
    return new CommandErrorResult(
      ProtocolError.commandExecution(CommandErrorCode.HistoryUnavailable, message),
    );
  }
}
