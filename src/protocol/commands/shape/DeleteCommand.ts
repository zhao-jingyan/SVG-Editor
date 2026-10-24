import { CommandSuccessResult } from "../../results/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandContext } from "../../CommandContext";
import type { CommandResult } from "../../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class DeleteCommand extends UndoableCommand {
  public readonly type = "delete";
  private placement?: ShapePlacement;

  public constructor(private readonly shapeId: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    this.placement = context.capturePlacement(this.shapeId);
    return context.deleteShape(this.shapeId);
  }

  public override async undo(context: CommandContext): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return this.notExecutedResult();
    }

    context.restorePlacements([placement]);
    const shape = placement.getShape();
    const parentId = placement.getParentId();
    const suffix = parentId === undefined ? "" : ` into g#${parentId}`;
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} restored${suffix}`,
    );
  }
}
