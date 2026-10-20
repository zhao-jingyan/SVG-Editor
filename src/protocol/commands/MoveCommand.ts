import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class MoveCommand extends UndoableCommand {
  public readonly type = "move";

  public constructor(
    private readonly shapeId: string,
    private readonly dx: number,
    private readonly dy: number,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.moveShape(this.shapeId, this.dx, this.dy);
  }
}
