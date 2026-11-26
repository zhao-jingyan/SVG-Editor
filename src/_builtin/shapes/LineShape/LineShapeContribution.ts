import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { LineShape } from "@/protocol/shapes/concrete/LineShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class LineShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new LineShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(ShapeType.Line);
  }

  public createShape(id: string, args: readonly string[]): LineShape {
    this.parser.requireArgumentCount(
      args,
      4,
      5,
      "create line <id> <x1> <y1> <x2> <y2> [stroke]",
    );
    const numbers = this.parser.parseNumbers(args, 4);
    return new LineShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      this.parser.optionalStyle(args[4]),
    );
  }

  public matchesSvg(tag: string): boolean {
    return tag === ShapeType.Line;
  }

  public readFromSvg(input: ShapeSvgReadInput): LineShape {
    return this.createShape(input.getId(), [
      this.requireAttr(input, "x1"),
      this.requireAttr(input, "y1"),
      this.requireAttr(input, "x2"),
      this.requireAttr(input, "y2"),
    ]);
  }

  private requireAttr(input: ShapeSvgReadInput, name: string): string {
    const value = input.getAttribute(name);

    if (value === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid <line>: missing attribute ${name}`,
      );
    }

    return value;
  }
}
