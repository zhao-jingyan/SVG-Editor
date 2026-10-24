import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class ReorderCommand extends UndoableCommand {
  public readonly type = "reorder";
  private placement?: ShapePlacement;

  public constructor(
    private readonly shapeId: string,
    private readonly position: "front" | "back",
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.placement = receiver.capturePlacement(this.shapeId);
    return receiver.reorderShape(this.shapeId, this.position);
  }

  public override undo(receiver: CommandReceiver): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    receiver.restorePlacements([placement]);
    const shape = placement.getShape();
    return Promise.resolve(
      new CommandSuccessResult(
        `${shape.getType()}#${shape.getId()} moved back`,
      ),
    );
  }
}
