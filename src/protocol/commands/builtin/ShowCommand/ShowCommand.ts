import { Command } from "../../_common/Command";
import type { CommandReceiver } from "../../../receivers/CommandReceiver";
import type { CommandResult } from "../../../results/CommandResult";

export class ShowCommand extends Command {
  public constructor(private readonly shapeId: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.show(this.shapeId);
  }
}
