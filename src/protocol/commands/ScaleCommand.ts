import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class ScaleCommand extends UndoableCommand {
  public readonly type = "scale";

  public constructor(
    private readonly shapeId: string,
    private readonly factor: number,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.scaleShape(this.shapeId, this.factor);
  }
}
