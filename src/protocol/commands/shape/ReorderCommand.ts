import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandContext } from "../../CommandContext";
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

  public execute(context: CommandContext): Promise<CommandResult> {
    this.placement = context.capturePlacement(this.shapeId);
    return context.reorderShape(this.shapeId, this.position);
  }

  public override undo(context: CommandContext): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    context.restorePlacements([placement]);
    const shape = placement.getShape();
    return Promise.resolve(
      new CommandSuccessResult(
        `${shape.getType()}#${shape.getId()} moved back`,
      ),
    );
  }
}
