import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { EllipseShape } from "@/protocol/shapes/concrete/EllipseShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class EllipseShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new EllipseShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(ShapeType.Ellipse);
  }

  public createShape(id: string, args: readonly string[]): EllipseShape {
    this.parser.requireArgumentCount(
      args,
      4,
      5,
      "create ellipse <id> <cx> <cy> <rx> <ry> [fill]",
    );
    const numbers = this.parser.parseNumbers(args, 4);
    return new EllipseShape(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      this.parser.optionalStyle(args[4]),
    );
  }

  public matchesSvg(tag: string): boolean {
    return tag === ShapeType.Ellipse;
  }

  public readFromSvg(input: ShapeSvgReadInput): EllipseShape {
    return this.createShape(input.getId(), [
      this.requireAttr(input, "cx"),
      this.requireAttr(input, "cy"),
      this.requireAttr(input, "rx"),
      this.requireAttr(input, "ry"),
    ]);
  }

  private requireAttr(input: ShapeSvgReadInput, name: string): string {
    const value = input.getAttribute(name);

    if (value === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid <ellipse>: missing attribute ${name}`,
      );
    }

    return value;
  }
}
