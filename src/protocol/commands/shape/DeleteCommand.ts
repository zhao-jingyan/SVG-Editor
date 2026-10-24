import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class DeleteCommand extends UndoableCommand {
  public readonly type = "delete";
  private placement?: ShapePlacement;

  public constructor(private readonly shapeId: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.placement = receiver.capturePlacement(this.shapeId);
    return receiver.deleteShape(this.shapeId);
  }

  public override async undo(receiver: CommandReceiver): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return this.notExecutedResult();
    }

    receiver.restorePlacements([placement]);
    const shape = placement.getShape();
    const parentId = placement.getParentId();
    const suffix = parentId === undefined ? "" : ` into g#${parentId}`;
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} restored${suffix}`,
    );
  }
}
