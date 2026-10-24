import { Command } from "../Command";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class ShowCommand extends Command {
  public readonly type = "show";

  public constructor(private readonly shapeId: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.show(this.shapeId);
  }
}
