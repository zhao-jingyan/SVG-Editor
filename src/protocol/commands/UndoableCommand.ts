import { Command } from "./Command";
import type { CommandReceiver } from "../CommandReceiver";
import { CommandErrorCode } from "../errors/CommandErrorCode";
import { ProtocolError } from "../errors/ProtocolError";
import { CommandErrorResult } from "../results/outcomes/CommandErrorResult";
import type { CommandResult } from "../results/CommandResult";

export abstract class UndoableCommand extends Command {
  public async undo(_receiver: CommandReceiver): Promise<CommandResult> {
    return new CommandErrorResult(
      ProtocolError.commandExecution(
        CommandErrorCode.CommandNotImplemented,
        `undo is not implemented for command: ${this.type}`,
      ),
    );
  }

  protected notExecutedResult(): CommandResult {
    return new CommandErrorResult(
      ProtocolError.commandExecution(
        CommandErrorCode.InvalidArgument,
        `command has not been executed: ${this.type}`,
      ),
    );
  }
}
