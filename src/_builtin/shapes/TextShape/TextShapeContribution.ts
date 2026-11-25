import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class TextShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): TextShape => {
      parser.requireArgumentCount(
        args,
        3,
        3,
        'create text <id> <x> <y> "content"',
      );
      const numbers = parser.parseNumbers(args, 2);
      return new TextShape(id, numbers[0], numbers[1], args[2]);
    };

    return new ShapeContribution(
      ShapeType.Text,
      create,
      (tag) => tag === ShapeType.Text,
      (input) =>
        create(input.getId(), [
          TextShapeContribution.requireAttr(input, "x"),
          TextShapeContribution.requireAttr(input, "y"),
          input.getTextContent(),
        ]),
    );
  }

  private static requireAttr(input: ShapeSvgReadInput, name: string): string {
    const value = input.getAttribute(name);
    if (value === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid <text>: missing attribute ${name}`,
      );
    }
    return value;
  }
}
