import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";
import { BoxShape } from "./BoxShape";

export class BoxShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): BoxShape => {
      parser.requireArgumentCount(
        args,
        5,
        5,
        'create box <id> <x> <y> <w> <h> "<title>"',
      );
      const numbers = parser.parseNumbers(args, 4);
      return BoxShape.create(
        id,
        numbers[0],
        numbers[1],
        numbers[2],
        numbers[3],
        args[4],
      );
    };

    return new ShapeContribution(
      BoxShape.TYPE_NAME,
      create,
      (tag, dataKind) =>
        tag === ShapeType.Group && dataKind === BoxShape.DATA_KIND,
      (input) => BoxShape.fromChildren(input.getId(), input.getChildren()),
    );
  }
}
