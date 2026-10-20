import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class UngroupCommand extends UndoableCommand {
  public readonly type = "ungroup";

  public constructor(private readonly containerId: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.ungroupShapes(this.containerId);
  }
}
