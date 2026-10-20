import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class DeleteCommand extends UndoableCommand {
  public readonly type = "delete";

  public constructor(private readonly shapeId: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.deleteShape(this.shapeId);
  }
}
