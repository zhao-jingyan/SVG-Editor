import type { EditableAttribute } from "../../EditableAttribute";
import { StyledShape } from "../model/StyledShape";
import { ShapeType } from "../model/ShapeType";
import { ShapePosition } from "../model/ShapePosition";
import type { ShapeVisitor } from "../visitor/ShapeVisitor";

export class RectShape extends StyledShape {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
  ) {
    super(id, fill);
    this.x = this.requireFiniteNumber(x, "x");
    this.y = this.requireFiniteNumber(y, "y");
    this.width = this.requireFiniteNumber(width, "width");
    this.height = this.requireFiniteNumber(height, "height");
  }

  public override getType(): ShapeType {
    return ShapeType.Rect;
  }

  public override getPosition(): ShapePosition {
    return new ShapePosition(this.x, this.y);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitRect(this);
  }

  public override move(dx: number, dy: number): void {
    const nextDx = this.requireFiniteNumber(dx, "dx");
    const nextDy = this.requireFiniteNumber(dy, "dy");
    this.x += nextDx;
    this.y += nextDy;
  }

  public override scale(factor: number): void {
    const nextFactor = this.requirePositiveScaleFactor(factor);
    this.x *= nextFactor;
    this.y *= nextFactor;
    this.width *= nextFactor;
    this.height *= nextFactor;
  }

  protected override setGeometryAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void {
    switch (attribute) {
      case "x":
        this.x = this.requireNumericAttribute(value, attribute);
        return;
      case "y":
        this.y = this.requireNumericAttribute(value, attribute);
        return;
      case "width":
        this.width = this.requireNumericAttribute(value, attribute);
        return;
      case "height":
        this.height = this.requireNumericAttribute(value, attribute);
        return;
      default:
        this.throwUnknownAttribute(attribute);
    }
  }

  protected override getGeometryAttribute(
    attribute: EditableAttribute,
  ): string | number | undefined {
    switch (attribute) {
      case "x":
        return this.x;
      case "y":
        return this.y;
      case "width":
        return this.width;
      case "height":
        return this.height;
      default:
        return undefined;
    }
  }
}
