import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { UndoableCommand } from "@/protocol/commands/UndoableCommand";
import type { Shape } from "@/protocol/shapes/model/Shape";

export class CreateCommand extends UndoableCommand {
  public constructor(
    private readonly shape: Shape,
    private readonly parentId?: string,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.createShape(this.shape, this.parentId);
  }

  public override undo(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.deleteShape(this.shape.getId());
  }
}
