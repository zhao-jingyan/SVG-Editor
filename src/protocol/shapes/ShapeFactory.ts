import { CircleShape } from "./CircleShape";
import { EllipseShape } from "./EllipseShape";
import { GroupShape } from "./GroupShape";
import { LineShape } from "./LineShape";
import { RectShape } from "./RectShape";
import type { Shape } from "./Shape";
import { ShapeError } from "./ShapeError";
import { TextShape } from "./TextShape";

export class ShapeFactory {
  public create(typeName: string, id: string, args: readonly string[]): Shape {
    switch (typeName) {
      case "rect":
        return this.createRect(id, args);
      case "circle":
        return this.createCircle(id, args);
      case "ellipse":
        return this.createEllipse(id, args);
      case "line":
        return this.createLine(id, args);
      case "text":
        return this.createText(id, args);
      case "g":
        return this.createGroup(id, args);
      default:
        throw new ShapeError("unknown-shape-type", `unknown shape type: ${typeName}`);
    }
  }

  private createRect(id: string, args: readonly string[]): RectShape {
    this.requireArgumentCount(
      args,
      4,
      5,
      "create rect <id> <x> <y> <width> <height> [fill]",
    );
    const numbers = this.parseNumbers(args, 4);
    return new RectShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      this.optionalStyle(args[4]),
    );
  }

  private createCircle(id: string, args: readonly string[]): CircleShape {
    this.requireArgumentCount(
      args,
      3,
      4,
      "create circle <id> <cx> <cy> <r> [fill]",
    );
    const numbers = this.parseNumbers(args, 3);
    return new CircleShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      this.optionalStyle(args[3]),
    );
  }

  private createEllipse(id: string, args: readonly string[]): EllipseShape {
    this.requireArgumentCount(
      args,
      4,
      5,
      "create ellipse <id> <cx> <cy> <rx> <ry> [fill]",
    );
    const numbers = this.parseNumbers(args, 4);
    return new EllipseShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      this.optionalStyle(args[4]),
    );
  }

  private createLine(id: string, args: readonly string[]): LineShape {
    this.requireArgumentCount(
      args,
      4,
      5,
      "create line <id> <x1> <y1> <x2> <y2> [stroke]",
    );
    const numbers = this.parseNumbers(args, 4);
    return new LineShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      this.optionalStyle(args[4]),
    );
  }

  private createText(id: string, args: readonly string[]): TextShape {
    this.requireArgumentCount(
      args,
      3,
      3,
      'create text <id> <x> <y> "content"',
    );
    const numbers = this.parseNumbers(args, 2);
    return new TextShape(id, numbers[0], numbers[1], args[2]);
  }

  private createGroup(id: string, args: readonly string[]): GroupShape {
    this.requireArgumentCount(args, 0, 0, "create g <id>");
    return new GroupShape(id);
  }

  private requireArgumentCount(
    args: readonly string[],
    minimum: number,
    maximum: number,
    usage: string,
  ): void {
    if (args.length < minimum || args.length > maximum) {
      throw new ShapeError("invalid-argument", `invalid arguments; usage: ${usage}`);
    }
  }

  private parseNumbers(args: readonly string[], count: number): number[] {
    const numbers: number[] = [];

    for (let index = 0; index < count; index += 1) {
      numbers.push(this.parseNumber(args[index]));
    }

    return numbers;
  }

  private parseNumber(token: string): number {
    if (token.trim().length === 0) {
      throw new ShapeError("invalid-number", "empty numeric value");
    }

    const value = Number(token);

    if (!Number.isFinite(value)) {
      throw new ShapeError("invalid-number", `invalid number: ${token}`);
    }

    return value;
  }

  private optionalStyle(style: string | undefined): string | undefined {
    if (style === undefined) {
      return undefined;
    }

    if (style === "in") {
      throw new ShapeError(
        "invalid-argument",
        "expected 'in <containerId>' at the end of the command",
      );
    }

    if (style.trim().length === 0) {
      throw new ShapeError("invalid-argument", "style value must not be empty");
    }

    return style;
  }
}
