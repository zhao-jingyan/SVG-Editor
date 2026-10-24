import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapeAttributeSnapshot } from "../memento/ShapeAttributeSnapshot";
import type { CommandReceiver } from "../../CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import type { EditableAttribute } from "../../EditableAttribute";
import { UndoableCommand } from "../UndoableCommand";

export class SetCommand extends UndoableCommand {
  public readonly type = "set";
  private snapshot?: ShapeAttributeSnapshot;

  public constructor(
    private readonly shapeId: string,
    private readonly attribute: EditableAttribute,
    private readonly value: string | number,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.snapshot = receiver.captureAttribute(this.shapeId, this.attribute);
    return receiver.setAttribute(this.shapeId, this.attribute, this.value);
  }

  public override undo(receiver: CommandReceiver): Promise<CommandResult> {
    const snapshot = this.snapshot;

    if (snapshot === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    receiver.restoreAttribute(snapshot);
    return Promise.resolve(
      new CommandSuccessResult(
        `${snapshot.getShapeType()}#${this.shapeId} updated: ${
          this.formatAttributeValue(snapshot.getValue(snapshot.getShapeId()))
        }`,
      ),
    );
  }

  private formatAttributeValue(value: string | number | undefined): string {
    if (value === undefined) {
      return `${this.attribute} unset`;
    }

    const formatted = typeof value === "string" ? `"${value}"` : `${value}`;
    return `${this.attribute}=${formatted}`;
  }
}
