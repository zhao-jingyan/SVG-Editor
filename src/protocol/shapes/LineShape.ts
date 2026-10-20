import type { EditableAttribute } from "../EditableAttribute";
import { StyledShape } from "./StyledShape";
import { ShapeType } from "./ShapeType";

export class LineShape extends StyledShape {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;

  public constructor(
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke?: string,
  ) {
    super(id, undefined, stroke);
    this.x1 = this.requireFiniteNumber(x1, "x1");
    this.y1 = this.requireFiniteNumber(y1, "y1");
    this.x2 = this.requireFiniteNumber(x2, "x2");
    this.y2 = this.requireFiniteNumber(y2, "y2");
  }

  public override getType(): ShapeType {
    return ShapeType.Line;
  }

  public override move(dx: number, dy: number): void {
    const nextDx = this.requireFiniteNumber(dx, "dx");
    const nextDy = this.requireFiniteNumber(dy, "dy");
    this.x1 += nextDx;
    this.y1 += nextDy;
    this.x2 += nextDx;
    this.y2 += nextDy;
  }

  public override scale(factor: number): void {
    const nextFactor = this.requirePositiveScaleFactor(factor);
    this.x1 *= nextFactor;
    this.y1 *= nextFactor;
    this.x2 *= nextFactor;
    this.y2 *= nextFactor;
  }

  protected override setGeometryAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void {
    switch (attribute) {
      case "x1":
        this.x1 = this.requireNumericAttribute(value, attribute);
        return;
      case "y1":
        this.y1 = this.requireNumericAttribute(value, attribute);
        return;
      case "x2":
        this.x2 = this.requireNumericAttribute(value, attribute);
        return;
      case "y2":
        this.y2 = this.requireNumericAttribute(value, attribute);
        return;
      default:
        this.throwUnknownAttribute(attribute);
    }
  }

  protected override getGeometryAttribute(
    attribute: EditableAttribute,
  ): string | number | undefined {
    switch (attribute) {
      case "x1":
        return this.x1;
      case "y1":
        return this.y1;
      case "x2":
        return this.x2;
      case "y2":
        return this.y2;
      default:
        return undefined;
    }
  }
}
