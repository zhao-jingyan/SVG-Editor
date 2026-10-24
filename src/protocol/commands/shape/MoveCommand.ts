import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";
import { CommandSuccessResult } from "../../results/outcomes/CommandSuccessResult";
import type { ShapeType } from "../../shapes/model/ShapeType";
import { UndoableCommand } from "../UndoableCommand";

export class MoveCommand extends UndoableCommand {
  public readonly type = "move";
  private shapeType?: ShapeType;

  public constructor(
    private readonly shapeId: string,
    private readonly dx: number,
    private readonly dy: number,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    this.shapeType = receiver.capturePlacement(this.shapeId).getShape().getType();
    return receiver.moveShape(this.shapeId, this.dx, this.dy);
  }

  public override async undo(receiver: CommandReceiver): Promise<CommandResult> {
    const shapeType = this.shapeType;

    if (shapeType === undefined) {
      return this.notExecutedResult();
    }

    const result = await receiver.moveShape(this.shapeId, -this.dx, -this.dy);

    if (!result.isSuccess()) {
      return result;
    }

    const position = receiver.capturePlacement(this.shapeId).getShape().getPosition();

    if (position !== undefined) {
      return new CommandSuccessResult(
        `${shapeType}#${this.shapeId} moved back to (${position.getX()},${position.getY()})`,
      );
    }

    return new CommandSuccessResult(
      `${shapeType}#${this.shapeId} moved back by (${-this.dx},${-this.dy})`,
    );
  }
}
