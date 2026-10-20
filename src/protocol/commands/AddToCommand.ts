import { CommandSuccessResult } from "../results/CommandSuccessResult";
import type { ShapePlacement } from "./ShapePlacement";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class AddToCommand extends UndoableCommand {
  public readonly type = "addto";
  private placement?: ShapePlacement;

  public constructor(
    private readonly containerId: string,
    private readonly shapeId: string,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    this.placement = context.capturePlacement(this.shapeId);
    return context.addToContainer(this.containerId, this.shapeId);
  }

  public override undo(context: CommandContext): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    context.restorePlacements([placement]);
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
