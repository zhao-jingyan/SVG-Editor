import { CommandErrorCode } from "../../errors/CommandErrorCode";
import { ProtocolError } from "../../errors/ProtocolError";
import type { Shape } from "../../shapes/model/Shape";

export class ShapePlacement {
  private readonly shape: Shape;
  private readonly parentId?: string;
  private readonly index: number;

  public constructor(shape: Shape, parentId: string | undefined, index: number) {
    if (!Number.isInteger(index) || index < 0) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid placement index: ${index}`,
      );
    }

    this.shape = shape;
    this.parentId = parentId;
    this.index = index;
  }

  public getShape(): Shape {
    return this.shape;
  }

  public getParentId(): string | undefined {
    return this.parentId;
  }

  public getIndex(): number {
    return this.index;
  }
}
