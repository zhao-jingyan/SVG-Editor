import { Command } from "../Command";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class UndoCommand extends Command {
  public readonly type = "undo";

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.undo();
  }
}
