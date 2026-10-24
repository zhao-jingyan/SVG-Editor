import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapePlacement } from "../memento/ShapePlacement";
import type { CommandReceiver } from "../../CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class UngroupCommand extends UndoableCommand {
  public readonly type = "ungroup";
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
