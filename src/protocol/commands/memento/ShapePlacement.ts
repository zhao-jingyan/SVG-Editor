import { CommandErrorCode } from "../../errors/CommandErrorCode";
import { DocumentError } from "../../errors/domain/DocumentError";
import type { Shape } from "../../shapes/Shape";

export class ShapePlacement {
  private readonly shape: Shape;
  private readonly parentId?: string;
  private readonly index: number;

  public constructor(shape: Shape, parentId: string | undefined, index: number) {
    if (!Number.isInteger(index) || index < 0) {
      throw new DocumentError(
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
