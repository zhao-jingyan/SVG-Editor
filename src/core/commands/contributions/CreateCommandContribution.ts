import { CreateCommand } from "../../../protocol/commands/shape/CreateCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";
import type { CommandParameters } from "../../../protocol/contribution/CommandParameters";
import type { ShapeFactory } from "../../../protocol/shapes/factory/ShapeFactory";

export class CreateCommandContribution {
  public static create(shapeFactory: ShapeFactory): CommandContribution {
    return new CommandContribution(
      "create",
      "create <type> <id> [params...] [in <containerId>]",
      new CommandHelp(
        "create <type> <id> [params...]",
        "create a shape",
      ),
      (parameters) =>
        CreateCommandContribution.parseCreate(shapeFactory, parameters),
    );
  }

  private static parseCreate(
    shapeFactory: ShapeFactory,
    parameters: CommandParameters,
  ): CreateCommand {
    parameters.expectMinimumLength(2);

    const shapeType = parameters.text(0, "shape type");
    const shapeId = parameters.text(1, "shape id");
    const parsedArguments =
      CreateCommandContribution.parseCreateArguments(parameters);
    const shape = shapeFactory.create(
      shapeType,
      shapeId,
      parsedArguments.values,
    );

    return new CreateCommand(shape, parsedArguments.parentId);
  }

  private static parseCreateArguments(parameters: CommandParameters): {
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
