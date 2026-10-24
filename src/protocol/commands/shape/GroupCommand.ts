import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
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

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.placements = this.memberIds.map((memberId) =>
      receiver.capturePlacement(memberId)
    );
    return receiver.groupShapes(this.containerId, this.memberIds);
  }

  public override async undo(receiver: CommandReceiver): Promise<CommandResult> {
    const placements = this.placements;

    if (placements === undefined) {
      return this.notExecutedResult();
    }

    receiver.restorePlacements(placements);
    const result = await receiver.deleteShape(this.containerId);

    if (!result.isSuccess()) {
      return result;
    }

    return new CommandSuccessResult(`g#${this.containerId} removed`);
  }
}
