import { CommandSuccessResult } from "../../../protocol/results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../../../protocol/commands/_common/memento/ShapePlacement";
import type { CommandReceiver } from "../../../protocol/receivers/CommandReceiver";
import type { CommandResult } from "../../../protocol/results/CommandResult";
import { UndoableCommand } from "../../../protocol/commands/_common/UndoableCommand";

export class UngroupCommand extends UndoableCommand {
  private placement?: ShapePlacement;

  public constructor(private readonly containerId: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.placement = receiver.capturePlacement(this.containerId);
    return receiver.ungroupShapes(this.containerId);
  }

  public override undo(receiver: CommandReceiver): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    receiver.restoreGroup(placement);
    return Promise.resolve(
      new CommandSuccessResult(`g#${this.containerId} restored`),
    );
  }
}
