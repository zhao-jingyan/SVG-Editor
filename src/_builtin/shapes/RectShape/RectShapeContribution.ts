import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class RectShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new RectShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(ShapeType.Rect);
  }

  public createShape(id: string, args: readonly string[]): RectShape {
    this.parser.requireArgumentCount(
      args,
      4,
      5,
      "create rect <id> <x> <y> <width> <height> [fill]",
    );
    const numbers = this.parser.parseNumbers(args, 4);
    return new RectShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      this.parser.optionalStyle(args[4]),
    );
  }

  public matchesSvg(tag: string): boolean {
    return tag === ShapeType.Rect;
  }

  public readFromSvg(input: ShapeSvgReadInput): RectShape {
    return this.createShape(input.getId(), [
      this.requireAttr(input, "x"),
      this.requireAttr(input, "y"),
      this.requireAttr(input, "width"),
      this.requireAttr(input, "height"),
    ]);
  }

  private requireAttr(input: ShapeSvgReadInput, name: string): string {
    const value = input.getAttribute(name);

    if (value === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid <rect>: missing attribute ${name}`,
      );
    }

    return value;
  }
}
