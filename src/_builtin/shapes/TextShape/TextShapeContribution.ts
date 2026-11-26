import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class TextShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new TextShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(ShapeType.Text);
  }

  public createShape(id: string, args: readonly string[]): TextShape {
    this.parser.requireArgumentCount(
      args,
      3,
      3,
      'create text <id> <x> <y> "content"',
    );
    const numbers = this.parser.parseNumbers(args, 2);
    return new TextShape(id, numbers[0], numbers[1], args[2]);
  }

  public matchesSvg(tag: string): boolean {
    return tag === ShapeType.Text;
  }

  public readFromSvg(input: ShapeSvgReadInput): TextShape {
    return this.createShape(input.getId(), [
      this.requireAttr(input, "x"),
      this.requireAttr(input, "y"),
      input.getTextContent(),
    ]);
  }

  private requireAttr(input: ShapeSvgReadInput, name: string): string {
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
