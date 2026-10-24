import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";
import type { Shape } from "../../shapes/model/Shape";

export class CreateCommand extends UndoableCommand {
  public readonly type = "create";

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
