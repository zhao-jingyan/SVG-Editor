import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { EllipseShape } from "@/protocol/shapes/concrete/EllipseShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class EllipseShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): EllipseShape => {
      parser.requireArgumentCount(
        args,
        4,
        5,
        "create ellipse <id> <cx> <cy> <rx> <ry> [fill]",
      );
      const numbers = parser.parseNumbers(args, 4);
      return new EllipseShape(
        id,
        numbers[0],
        numbers[1],
        numbers[2],
        numbers[3],
        parser.optionalStyle(args[4]),
      );
    };

    return new ShapeContribution(
      ShapeType.Ellipse,
      create,
      (tag) => tag === ShapeType.Ellipse,
      (input) =>
        create(input.getId(), [
          EllipseShapeContribution.requireAttr(input, "cx"),
          EllipseShapeContribution.requireAttr(input, "cy"),
          EllipseShapeContribution.requireAttr(input, "rx"),
          EllipseShapeContribution.requireAttr(input, "ry"),
        ]),
    );
  }

  private static requireAttr(input: ShapeSvgReadInput, name: string): string {
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
