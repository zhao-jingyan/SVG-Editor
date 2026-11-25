import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { ShapeArgumentParser } from "@/protocol/shapes/contribution/ShapeArgumentParser";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import { ShapeType } from "@/protocol/shapes/model/ShapeType";

export class GroupShapeContribution {
  public static create(
    parser: ShapeArgumentParser = new ShapeArgumentParser(),
  ): ShapeContribution {
    const create = (id: string, args: readonly string[]): GroupShape => {
      parser.requireArgumentCount(args, 0, 0, "create g <id>");
      return new GroupShape(id);
    };

    return new ShapeContribution(
      ShapeType.Group,
      create,
      (tag) => tag === ShapeType.Group,
      (input) => {
        const group = create(input.getId(), []);
        for (const child of input.getChildren()) {
          group.addChild(child);
        }
        return group;
      },
    );
  }
}
