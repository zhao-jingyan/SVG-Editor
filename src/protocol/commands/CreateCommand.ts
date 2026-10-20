import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";
import type { ShapeSpec } from "../ShapeSpec";
import { UndoableCommand } from "../UndoableCommand";

export class CreateCommand extends UndoableCommand {
  public readonly type = "create";

  public constructor(
    private readonly shape: ShapeSpec,
    private readonly parentId?: string,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.createShape(this.shape, this.parentId);
  }
}
