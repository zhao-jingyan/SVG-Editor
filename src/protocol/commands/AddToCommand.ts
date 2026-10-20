import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class AddToCommand extends UndoableCommand {
  public readonly type = "addto";

  public constructor(
    private readonly containerId: string,
    private readonly shapeId: string,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.addToContainer(this.containerId, this.shapeId);
  }
}
