import { CreateCommand } from "./CreateCommand";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { ShapeCatalog } from "@/protocol/shapes/contribution/ShapeCatalog";

export class CreateCommandContribution {
  public static create(shapeCatalog: ShapeCatalog): CommandContribution {
    return new CommandContribution(
      "create",
      "create <type> <id> [params...] [in <containerId>]",
      new CommandHelp(
        "create <type> <id> [params...]",
        "create a shape",
      ),
      (parameters) =>
        CreateCommandContribution.parseCreate(shapeCatalog, parameters),
    );
  }

  private static parseCreate(
    shapeCatalog: ShapeCatalog,
    parameters: CommandParameters,
  ): CreateCommand {
    parameters.expectMinimumLength(2);

    const shapeType = parameters.text(0, "shape type");
    const shapeId = parameters.text(1, "shape id");
    const parsedArguments =
      CreateCommandContribution.parseCreateArguments(parameters);
    const contribution = shapeCatalog.find(shapeType);

    if (contribution === undefined) {
      throw ProtocolError.shape(
        CommandErrorCode.UnknownShapeType,
        `unknown shape type: ${shapeType} (is the plugin loaded?)`,
      );
    }

    const shape = contribution.create(shapeId, parsedArguments.values);
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
