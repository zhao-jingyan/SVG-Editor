import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";

export class RectShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): RectShape => {
      parser.requireArgumentCount(
        args,
        4,
        5,
        "create rect <id> <x> <y> <width> <height> [fill]",
      );
      const numbers = parser.parseNumbers(args, 4);
      return new RectShape(
        id,
        numbers[0],
        numbers[1],
        numbers[2],
        numbers[3],
        parser.optionalStyle(args[4]),
      );
    };

    return new ShapeContribution(
      ShapeType.Rect,
      create,
      (tag) => tag === ShapeType.Rect,
      (input) =>
        create(input.getId(), [
          RectShapeContribution.requireAttr(input, "x"),
          RectShapeContribution.requireAttr(input, "y"),
          RectShapeContribution.requireAttr(input, "width"),
          RectShapeContribution.requireAttr(input, "height"),
        ]),
    );
  }

  private static requireAttr(input: ShapeSvgReadInput, name: string): string {
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
