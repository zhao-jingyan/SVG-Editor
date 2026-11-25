import { Command } from "@/protocol/commands/Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";

export class TreeCommand extends Command {
  public constructor(private readonly shapeId?: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.tree(this.shapeId);
  }
}
