import type { Command } from "../protocol/Command";
import { ProtocolError } from "../protocol/errors/ProtocolError";
import { CommandErrorResult } from "../protocol/results/CommandErrorResult";
import type { CommandResult } from "../protocol/results/CommandResult";
import { EditorContext } from "./EditorContext";
import type { Executor } from "./Executor";

export class CommandExecutor implements Executor {
  public constructor(private readonly context: EditorContext) {}

  public async execute(command: Command): Promise<CommandResult> {
    try {
      return await this.context.execute(command);
    } catch (error: unknown) {
      if (error instanceof ProtocolError) {
        return new CommandErrorResult(error);
      }

      throw error;
    }
  }
}
