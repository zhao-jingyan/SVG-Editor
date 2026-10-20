import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import { UndoableCommand } from "../UndoableCommand";

export class GroupCommand extends UndoableCommand {
  public readonly type = "group";

  public constructor(
    private readonly containerId: string,
    private readonly memberIds: readonly string[],
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.groupShapes(this.containerId, this.memberIds);
  }
}
