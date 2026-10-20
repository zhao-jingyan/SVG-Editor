import type { EditableAttribute } from "../EditableAttribute";
import { CommandErrorCode } from "../errors/CommandErrorCode";
import { ShapeError } from "../errors/ShapeError";
import { Shape } from "./Shape";

export abstract class StyledShape extends Shape {
  private fill?: string;
  private stroke?: string;
  private strokeWidth?: number;

  protected constructor(
    id: string,
    fill?: string,
    stroke?: string,
    strokeWidth?: number,
  ) {
    super(id);
    this.fill = fill;
    this.stroke = stroke;

    if (strokeWidth !== undefined) {
      this.strokeWidth = this.requireFiniteNumber(strokeWidth, "stroke-width");
    }
  }

  public override setAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void {
    switch (attribute) {
      case "fill":
        this.fill = this.requireStringAttribute(value, attribute);
        return;
      case "stroke":
        this.stroke = this.requireStringAttribute(value, attribute);
        return;
      case "stroke-width":
        this.strokeWidth = this.requireNumericAttribute(value, attribute);
        return;
      default:
        this.setGeometryAttribute(attribute, value);
    }
  }

  public override getAttribute(
    attribute: EditableAttribute,
  ): string | number | undefined {
    switch (attribute) {
      case "fill":
        return this.fill;
      case "stroke":
        return this.stroke;
      case "stroke-width":
        return this.strokeWidth;
      default:
        return this.getGeometryAttribute(attribute);
    }
  }

  protected abstract setGeometryAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void;

  protected abstract getGeometryAttribute(
    attribute: EditableAttribute,
  ): string | number | undefined;

  protected throwUnknownAttribute(attribute: EditableAttribute): never {
    throw new ShapeError(
      CommandErrorCode.UnknownAttribute,
      `unknown attribute: ${attribute}`,
    );
  }
}
