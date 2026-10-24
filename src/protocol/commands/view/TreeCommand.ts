import { Command } from "../Command";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class TreeCommand extends Command {
  public readonly type = "tree";

  public constructor(private readonly shapeId?: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.tree(this.shapeId);
  }
}
