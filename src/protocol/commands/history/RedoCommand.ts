import { Command } from "../Command";
import type { CommandReceiver } from "../../CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class RedoCommand extends Command {
  public readonly type = "redo";

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.redo();
  }
}
