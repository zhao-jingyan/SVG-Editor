import { Command } from "./Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { CommandErrorResult } from "@/protocol/results/outcomes/CommandErrorResult";
import type { CommandResult } from "@/protocol/results/CommandResult";

export abstract class UndoableCommand extends Command {
  public async undo(_receiver: CommandReceiver): Promise<CommandResult> {
    return new CommandErrorResult(
      ProtocolError.commandExecution(
        CommandErrorCode.CommandNotImplemented,
        `undo is not implemented for command: ${this.constructor.name}`,
      ),
    );
  }

  protected notExecutedResult(): CommandResult {
    return new CommandErrorResult(
      ProtocolError.commandExecution(
        CommandErrorCode.InvalidArgument,
        `command has not been executed: ${this.constructor.name}`,
      ),
    );
  }
}
