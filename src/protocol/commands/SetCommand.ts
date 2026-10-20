import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";
import type { EditableAttribute } from "../EditableAttribute";
import { UndoableCommand } from "../UndoableCommand";

export class SetCommand extends UndoableCommand {
  public readonly type = "set";

  public constructor(
    private readonly shapeId: string,
    private readonly attribute: EditableAttribute,
    private readonly value: string | number,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.setAttribute(this.shapeId, this.attribute, this.value);
  }
}
