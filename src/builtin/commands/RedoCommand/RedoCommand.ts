import { Command } from "@/protocol/commands/_common/Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";

export class RedoCommand extends Command {
  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.redo();
  }
}
