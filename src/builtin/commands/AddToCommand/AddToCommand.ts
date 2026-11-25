import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "@/protocol/commands/_common/memento/ShapePlacement";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { UndoableCommand } from "@/protocol/commands/_common/UndoableCommand";

export class AddToCommand extends UndoableCommand {
  private placement?: ShapePlacement;

  public constructor(
    private readonly containerId: string,
    private readonly shapeId: string,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.placement = receiver.capturePlacement(this.shapeId);
    return receiver.addToContainer(this.containerId, this.shapeId);
  }

  public override undo(receiver: CommandReceiver): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    receiver.restorePlacements([placement]);
    const shape = placement.getShape();
    const parentId = placement.getParentId();
    const suffix = parentId === undefined ? "canvas" : `g#${parentId}`;
    return Promise.resolve(
      new CommandSuccessResult(
        `${shape.getType()}#${shape.getId()} moved back to ${suffix}`,
      ),
    );
  }
}
