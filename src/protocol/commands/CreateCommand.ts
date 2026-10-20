import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";
import { UndoableCommand } from "../UndoableCommand";
import type { Shape } from "../shapes/Shape";

export class CreateCommand extends UndoableCommand {
  public readonly type = "create";

  public constructor(
    private readonly shape: Shape,
    private readonly parentId?: string,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.createShape(this.shape, this.parentId);
  }
}
