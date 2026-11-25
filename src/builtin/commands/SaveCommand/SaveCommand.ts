import { Command } from "../../../protocol/commands/_common/Command";
import type { CommandReceiver } from "../../../protocol/receivers/CommandReceiver";
import type { CommandResult } from "../../../protocol/results/CommandResult";

export class SaveCommand extends Command {
  public constructor(private readonly path?: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.save(this.path);
  }
}
