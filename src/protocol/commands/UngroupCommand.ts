import { CommandSuccessResult } from "../results/CommandSuccessResult";
import type { ShapePlacement } from "./ShapePlacement";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class UngroupCommand extends UndoableCommand {
  public readonly type = "ungroup";
  private placement?: ShapePlacement;

  public constructor(private readonly containerId: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    this.placement = context.capturePlacement(this.containerId);
    return context.ungroupShapes(this.containerId);
  }

  public override undo(context: CommandContext): Promise<CommandResult> {
    const placement = this.placement;

    if (placement === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    context.restoreGroup(placement);
    return Promise.resolve(
      new CommandSuccessResult(`g#${this.containerId} restored`),
    );
  }
}
