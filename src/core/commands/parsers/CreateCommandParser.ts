import { CreateCommand } from "../../../protocol/commands/shape/CreateCommand";
import type { CommandParameters } from "../../../protocol/contribution/CommandParameters";
import type { ShapeFactory } from "../../../protocol/shapes/factory/ShapeFactory";

/**
 * 构造 create 命令并解析可选的 in 尾缀。
 */
export class CreateCommandParser {
  public constructor(private readonly shapeFactory: ShapeFactory) {}

  public parse(parameters: CommandParameters): CreateCommand {
    parameters.expectMinimumLength(2);

    const shapeType = parameters.text(0, "shape type");
    const shapeId = parameters.text(1, "shape id");
    const parsedArguments = this.parseArguments(parameters);
    const shape = this.shapeFactory.create(
      shapeType,
      shapeId,
      parsedArguments.values,
    );

    return new CreateCommand(shape, parsedArguments.parentId);
  }

  private parseArguments(parameters: CommandParameters): {
    values: readonly string[];
    parentId?: string;
  } {
    const parentKeywordIndex = parameters.length - 2;

    if (parameters.tokenAt(parentKeywordIndex) !== "in") {
      return { values: parameters.slice(2) };
    }

    return {
      values: parameters.slice(2, parentKeywordIndex),
      parentId: parameters.text(parentKeywordIndex + 1, "container id"),
    };
  }
}
