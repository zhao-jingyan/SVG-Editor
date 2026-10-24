import type { EditableAttribute } from "../../EditableAttribute";
import { StyledShape } from "../model/StyledShape";
import { ShapeType } from "../model/ShapeType";
import { ShapePosition } from "../model/ShapePosition";
import type { ShapeVisitor } from "../visitor/ShapeVisitor";

export class CircleShape extends StyledShape {
  private cx: number;
  private cy: number;
  private r: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    r: number,
    fill?: string,
  ) {
    super(id, fill);
    this.cx = this.requireFiniteNumber(cx, "cx");
    this.cy = this.requireFiniteNumber(cy, "cy");
    this.r = this.requireFiniteNumber(r, "r");
  }

  public override getType(): ShapeType {
    return ShapeType.Circle;
  }

  public override getPosition(): ShapePosition {
    return new ShapePosition(this.cx, this.cy);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitCircle(this);
  }

  public override move(dx: number, dy: number): void {
    const nextDx = this.requireFiniteNumber(dx, "dx");
    const nextDy = this.requireFiniteNumber(dy, "dy");
    this.cx += nextDx;
    this.cy += nextDy;
  }

  public override scale(factor: number): void {
    const nextFactor = this.requirePositiveScaleFactor(factor);
    this.cx *= nextFactor;
    this.cy *= nextFactor;
    this.r *= nextFactor;
  }

  protected override setGeometryAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void {
    switch (attribute) {
      case "cx":
        this.cx = this.requireNumericAttribute(value, attribute);
        return;
      case "cy":
        this.cy = this.requireNumericAttribute(value, attribute);
        return;
      case "r":
        this.r = this.requireNumericAttribute(value, attribute);
        return;
      default:
        this.throwUnknownAttribute(attribute);
    }
  }

  protected override getGeometryAttribute(
    attribute: EditableAttribute,
  ): string | number | undefined {
    switch (attribute) {
      case "cx":
        return this.cx;
      case "cy":
        return this.cy;
      case "r":
        return this.r;
      default:
        return undefined;
    }
  }
}
