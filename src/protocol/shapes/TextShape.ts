import type { EditableAttribute } from "../EditableAttribute";
import { StyledShape } from "./StyledShape";
import { ShapeType } from "./ShapeType";

export class TextShape extends StyledShape {
  private x: number;
  private y: number;
  private content: string;

  public constructor(
    id: string,
    x: number,
    y: number,
    content: string,
    fill?: string,
  ) {
    super(id, fill);
    this.x = this.requireFiniteNumber(x, "x");
    this.y = this.requireFiniteNumber(y, "y");
    this.content = content;
  }

  public override getType(): ShapeType {
    return ShapeType.Text;
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
      case "text":
        this.content = this.requireStringAttribute(value, attribute);
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
      case "text":
        return this.content;
      default:
        return undefined;
    }
  }
}
