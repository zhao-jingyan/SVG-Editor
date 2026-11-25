import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { LineShape } from "@/protocol/shapes/concrete/LineShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class LineShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): LineShape => {
      parser.requireArgumentCount(
        args,
        4,
        5,
        "create line <id> <x1> <y1> <x2> <y2> [stroke]",
      );
      const numbers = parser.parseNumbers(args, 4);
      return new LineShape(
        id,
        numbers[0],
        numbers[1],
        numbers[2],
        numbers[3],
        parser.optionalStyle(args[4]),
      );
    };

    return new ShapeContribution(
      ShapeType.Line,
      create,
      (tag) => tag === ShapeType.Line,
      (input) =>
        create(input.getId(), [
          LineShapeContribution.requireAttr(input, "x1"),
          LineShapeContribution.requireAttr(input, "y1"),
          LineShapeContribution.requireAttr(input, "x2"),
          LineShapeContribution.requireAttr(input, "y2"),
        ]),
    );
  }

  private static requireAttr(input: ShapeSvgReadInput, name: string): string {
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
