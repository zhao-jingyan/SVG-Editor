import { Command } from "../Command";
import type { CommandContext } from "../../CommandContext";
import type { CommandResult } from "../../results/CommandResult";

export class TreeCommand extends Command {
  public readonly type = "tree";

  public constructor(private readonly shapeId?: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.tree(this.shapeId);
  }
}
