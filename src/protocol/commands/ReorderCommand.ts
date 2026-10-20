import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class ReorderCommand extends UndoableCommand {
  public readonly type = "reorder";

  public constructor(
    private readonly shapeId: string,
    private readonly position: "front" | "back",
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.reorderShape(this.shapeId, this.position);
  }
}
