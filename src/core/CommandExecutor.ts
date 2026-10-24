import type { Command } from "../protocol/commands/Command";
import { UndoableCommand } from "../protocol/commands/UndoableCommand";
import { ProtocolError } from "../protocol/errors/ProtocolError";
import type { Executor } from "../protocol/Executor";
import { CommandErrorResult } from "../protocol/results/outcomes/CommandErrorResult";
import type { CommandResult } from "../protocol/results/CommandResult";
import { EditorSession } from "./EditorSession";

export class CommandExecutor implements Executor {
  public constructor(private readonly receiver: EditorSession) {}

  public async execute(command: Command): Promise<CommandResult> {
    try {
      const result = await command.execute(this.receiver);

      if (result.isSuccess() && command instanceof UndoableCommand) {
        this.receiver.recordSuccessfulCommand(command);
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof ProtocolError) {
        return new CommandErrorResult(error);
      }

      throw error;
    }
  }
}
