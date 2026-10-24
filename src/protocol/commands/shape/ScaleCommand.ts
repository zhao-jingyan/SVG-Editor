import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapeType } from "../../shapes/model/ShapeType";
import { UndoableCommand } from "../UndoableCommand";

export class ScaleCommand extends UndoableCommand {
  public readonly type = "scale";
  private shapeType?: ShapeType;

  public constructor(
    private readonly shapeId: string,
    private readonly factor: number,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.shapeType = receiver.capturePlacement(this.shapeId).getShape().getType();
    return receiver.scaleShape(this.shapeId, this.factor);
  }

  public override async undo(receiver: CommandReceiver): Promise<CommandResult> {
    const shapeType = this.shapeType;

    if (shapeType === undefined) {
      return this.notExecutedResult();
    }

    const inverseFactor = 1 / this.factor;
    const result = await receiver.scaleShape(this.shapeId, inverseFactor);

    if (!result.isSuccess()) {
      return result;
    }

    return new CommandSuccessResult(
      `${shapeType}#${this.shapeId} scaled back by ${inverseFactor}`,
    );
  }
}
