import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";
import type { ShapeAttributeSnapshot } from "@/protocol/commands/memento/ShapeAttributeSnapshot";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { UndoableCommand } from "@/protocol/commands/UndoableCommand";

export class SetCommand extends UndoableCommand {
  private snapshot?: ShapeAttributeSnapshot;

  public constructor(
    private readonly shapeId: string,
    private readonly attribute: string,
    private readonly value: string | number,
  ) {
    super();
  }

  public async execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.snapshot = receiver.captureAttribute(this.shapeId, this.attribute);

    try {
      return await receiver.setAttribute(
        this.shapeId,
        this.attribute,
        this.value,
      );
    } catch (error: unknown) {
      receiver.restoreAttribute(this.snapshot);
      this.snapshot = undefined;
      throw error;
    }
  }

  public override undo(receiver: CommandReceiver): Promise<CommandResult> {
    const snapshot = this.snapshot;

    if (snapshot === undefined) {
      return Promise.resolve(this.notExecutedResult());
    }

    receiver.restoreAttribute(snapshot);
    const leafId = snapshot.getShapeIds()[0] ?? snapshot.getShapeId();
    const previous = snapshot.getValue(leafId);
    const attribute = snapshot.getAttribute();

    if (attribute === "label") {
      const text =
        previous === undefined
          ? ""
          : typeof previous === "string"
            ? previous
            : `${previous}`;
      return Promise.resolve(
        new CommandSuccessResult(
          `${snapshot.getShapeType()}#${this.shapeId} label restored: "${text}"`,
        ),
      );
    }

    return Promise.resolve(
      new CommandSuccessResult(
        `${snapshot.getShapeType()}#${this.shapeId} updated: ${
          this.formatAttributeValue(attribute, previous)
        }`,
      ),
    );
  }

  private formatAttributeValue(
    attribute: string,
    value: string | number | undefined,
  ): string {
    if (value === undefined) {
      return `${attribute} unset`;
    }

    const formatted = typeof value === "string" ? `"${value}"` : `${value}`;
    return `${attribute}=${formatted}`;
  }
}
