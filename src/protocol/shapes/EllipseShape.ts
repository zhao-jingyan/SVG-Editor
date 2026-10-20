import type { EditableAttribute } from "../EditableAttribute";
import { StyledShape } from "./StyledShape";
import { ShapeType } from "./ShapeType";
import type { ShapeVisitor } from "./ShapeVisitor";

export class EllipseShape extends StyledShape {
  private cx: number;
  private cy: number;
  private rx: number;
  private ry: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    fill?: string,
  ) {
    super(id, fill);
    this.cx = this.requireFiniteNumber(cx, "cx");
    this.cy = this.requireFiniteNumber(cy, "cy");
    this.rx = this.requireFiniteNumber(rx, "rx");
    this.ry = this.requireFiniteNumber(ry, "ry");
  }

  public override getType(): ShapeType {
    return ShapeType.Ellipse;
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitEllipse(this);
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
    this.rx *= nextFactor;
    this.ry *= nextFactor;
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
      case "rx":
        this.rx = this.requireNumericAttribute(value, attribute);
        return;
      case "ry":
        this.ry = this.requireNumericAttribute(value, attribute);
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
      case "rx":
        return this.rx;
      case "ry":
        return this.ry;
      default:
        return undefined;
    }
  }
}
