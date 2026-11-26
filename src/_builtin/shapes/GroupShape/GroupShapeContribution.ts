import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { ShapeSvgReadInput } from "@/protocol/shapes/contribution/ShapeSvgReadInput";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

/** 普通 g：认领任意 `<g>`；装配时须排在带 data-kind 的复合图形之后。 */
export class GroupShapeContribution extends ShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    return new GroupShapeContribution(parser);
  }

  private constructor(private readonly parser: ShapeArgumentParser) {
    super(ShapeType.Group);
  }

  public createShape(id: string, args: readonly string[]): GroupShape {
    this.parser.requireArgumentCount(args, 0, 0, "create g <id>");
    return new GroupShape(id);
  }

  public matchesSvg(tag: string): boolean {
    return tag === ShapeType.Group;
  }

  public readFromSvg(input: ShapeSvgReadInput): GroupShape {
    const group = this.createShape(input.getId(), []);

    for (const child of input.getChildren()) {
      group.addChild(child);
    }

    return group;
  }
}
