import type { CommandContext } from "../../CommandContext";
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

  public execute(context: CommandContext): Promise<CommandResult> {
    this.shapeType = context.capturePlacement(this.shapeId).getShape().getType();
    return context.scaleShape(this.shapeId, this.factor);
  }

  public override async undo(context: CommandContext): Promise<CommandResult> {
    const shapeType = this.shapeType;

    if (shapeType === undefined) {
      return this.notExecutedResult();
    }

    const inverseFactor = 1 / this.factor;
    const result = await context.scaleShape(this.shapeId, inverseFactor);

    if (!result.isSuccess()) {
      return result;
    }

    return new CommandSuccessResult(
      `${shapeType}#${this.shapeId} scaled back by ${inverseFactor}`,
    );
  }
}
