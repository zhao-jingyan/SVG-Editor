import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";

export class ShowCommand extends Command {
  public readonly type = "show";

  public constructor(private readonly shapeId: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.show(this.shapeId);
  }
}
