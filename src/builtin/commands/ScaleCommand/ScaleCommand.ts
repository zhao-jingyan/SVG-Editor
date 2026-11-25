import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";
import type { ShapeType } from "@/protocol/shapes/model/ShapeType";
import { UndoableCommand } from "@/protocol/commands/_common/UndoableCommand";

export class ScaleCommand extends UndoableCommand {
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
