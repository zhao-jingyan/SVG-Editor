import type { EditableAttribute } from "../../EditableAttribute";
import { CommandErrorCode } from "../../errors/CommandErrorCode";
import { ProtocolError } from "../../errors/ProtocolError";
import type { ShapeType } from "./ShapeType";
import type { ShapeVisitor } from "../visitor/ShapeVisitor";
import type { ShapePosition } from "./ShapePosition";

export abstract class Shape {
  private readonly id: string;

  protected constructor(id: string) {
    if (id.trim().length === 0) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        "shape id must not be empty",
      );
    }

    this.id = id;
  }

  public getId(): string {
    return this.id;
  }

  public abstract getType(): ShapeType;

  public abstract getPosition(): ShapePosition | undefined;

  public abstract accept<T>(visitor: ShapeVisitor<T>): T;

  public abstract move(dx: number, dy: number): void;

  public abstract scale(factor: number): void;

  public abstract setAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void;

  public abstract unsetAttribute(attribute: EditableAttribute): void;

  public abstract getAttribute(
    attribute: EditableAttribute,
  ): string | number | undefined;

  protected requireFiniteNumber(value: number, label: string): number {
    if (!Number.isFinite(value)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidNumber,
        `invalid number: ${label}`,
      );
    }

    return value;
  }

  protected requirePositiveScaleFactor(factor: number): number {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidScale,
        "scale factor must be positive",
      );
    }

    return factor;
  }

  protected requireNumericAttribute(
    value: string | number,
    attribute: EditableAttribute,
  ): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `attribute ${attribute} requires a finite number`,
      );
    }

    return value;
  }

  protected requireStringAttribute(
    value: string | number,
    attribute: EditableAttribute,
  ): string {
    if (typeof value !== "string") {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `attribute ${attribute} requires a string`,
      );
    }

    return value;
  }
}
