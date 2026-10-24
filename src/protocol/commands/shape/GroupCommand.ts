import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandContext } from "../../CommandContext";
import type { CommandResult } from "../../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class GroupCommand extends UndoableCommand {
  public readonly type = "group";
  private placements?: readonly ShapePlacement[];

  public constructor(
    private readonly containerId: string,
    private readonly memberIds: readonly string[],
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    this.placements = this.memberIds.map((memberId) =>
      context.capturePlacement(memberId)
    );
    return context.groupShapes(this.containerId, this.memberIds);
  }

  public override async undo(context: CommandContext): Promise<CommandResult> {
    const placements = this.placements;

    if (placements === undefined) {
      return this.notExecutedResult();
    }

    context.restorePlacements(placements);
    const result = await context.deleteShape(this.containerId);

    if (!result.isSuccess()) {
      return result;
    }

    return new CommandSuccessResult(`g#${this.containerId} removed`);
  }
}
