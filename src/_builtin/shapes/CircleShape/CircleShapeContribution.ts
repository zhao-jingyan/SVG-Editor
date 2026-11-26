import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { CircleShape } from "@/protocol/shapes/concrete/CircleShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class CircleShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new CircleShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(ShapeType.Circle);
  }

  public createShape(id: string, args: readonly string[]): CircleShape {
    this.parser.requireArgumentCount(
      args,
      3,
      4,
      "create circle <id> <cx> <cy> <r> [fill]",
    );
    const numbers = this.parser.parseNumbers(args, 3);
    return new CircleShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      this.parser.optionalStyle(args[3]),
    );
  }

  public matchesSvg(tag: string): boolean {
    return tag === ShapeType.Circle;
  }

  public readFromSvg(input: ShapeSvgReadInput): CircleShape {
    return this.createShape(input.getId(), [
      this.requireAttr(input, "cx"),
      this.requireAttr(input, "cy"),
      this.requireAttr(input, "r"),
    ]);
  }

  private requireAttr(input: ShapeSvgReadInput, name: string): string {
    const value = input.getAttribute(name);

    if (value === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid <circle>: missing attribute ${name}`,
      );
    }

    return value;
  }
}
