import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { CircleShape } from "@/protocol/shapes/concrete/CircleShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class CircleShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): CircleShape => {
      parser.requireArgumentCount(
        args,
        3,
        4,
        "create circle <id> <cx> <cy> <r> [fill]",
      );
      const numbers = parser.parseNumbers(args, 3);
      return new CircleShape(
        id,
        numbers[0],
        numbers[1],
        numbers[2],
        parser.optionalStyle(args[3]),
      );
    };

    return new ShapeContribution(
      ShapeType.Circle,
      create,
      (tag) => tag === ShapeType.Circle,
      (input) =>
        create(input.getId(), [
          CircleShapeContribution.requireAttr(input, "cx"),
          CircleShapeContribution.requireAttr(input, "cy"),
          CircleShapeContribution.requireAttr(input, "r"),
        ]),
    );
  }

  private static requireAttr(input: ShapeSvgReadInput, name: string): string {
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
