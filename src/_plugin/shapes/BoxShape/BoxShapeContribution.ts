import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";
import { BoxShape } from "./BoxShape";

/** box 图形扩展点实现：创建模板、`g[data-kind=box]` 认领与读回校验。 */
export class BoxShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new BoxShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(BoxShape.TYPE_NAME);
  }

  public createShape(id: string, args: readonly string[]): BoxShape {
    this.parser.requireArgumentCount(
      args,
      5,
      5,
      'create box <id> <x> <y> <w> <h> "<title>"',
    );
    const numbers = this.parser.parseNumbers(args, 4);
    return BoxShape.create(
      id,
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3],
      args[4],
    );
  }

  public matchesSvg(tag: string, dataKind: string | undefined): boolean {
    return tag === ShapeType.Group && dataKind === BoxShape.DATA_KIND;
  }

  public readFromSvg(input: ShapeSvgReadInput): BoxShape {
    return BoxShape.fromChildren(input.getId(), input.getChildren());
  }
}
