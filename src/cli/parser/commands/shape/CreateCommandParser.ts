import { CreateCommand } from "../../../../protocol/commands/CreateCommand";
import type { ShapeFactory } from "../../../../protocol/shapes/ShapeFactory";
import type { CommandArguments } from "../../arguments/CommandArguments";

/**
 * 构造 create 命令并解析可选的 in 尾缀。
 */
export class CreateCommandParser {
  public constructor(private readonly shapeFactory: ShapeFactory) {}

  public parse(args: CommandArguments): CreateCommand {
    args.expectMinimumLength(3);

    const shapeType = args.text(1, "shape type");
    const shapeId = args.text(2, "shape id");
    const parsedArguments = this.parseArguments(args);
    const shape = this.shapeFactory.create(
      shapeType,
      shapeId,
      parsedArguments.values,
    );

    return new CreateCommand(shape, parsedArguments.parentId);
  }

  private parseArguments(args: CommandArguments): {
    values: readonly string[];
    parentId?: string;
  } {
    const parentKeywordIndex = args.length - 2;

    if (args.tokenAt(parentKeywordIndex) !== "in") {
      return { values: args.slice(3) };
    }

    return {
      values: args.slice(3, parentKeywordIndex),
      parentId: args.text(parentKeywordIndex + 1, "container id"),
    };
  }
}
