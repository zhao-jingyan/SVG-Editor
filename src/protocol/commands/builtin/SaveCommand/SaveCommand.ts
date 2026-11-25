import { Command } from "../../_common/Command";
import type { CommandReceiver } from "../../../receivers/CommandReceiver";
import type { CommandResult } from "../../../results/CommandResult";

export class SaveCommand extends Command {
  public constructor(private readonly path?: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.save(this.path);
  }
}
