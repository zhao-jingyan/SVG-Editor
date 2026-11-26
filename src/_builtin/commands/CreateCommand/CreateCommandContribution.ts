import { CreateCommand } from "./CreateCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { ShapeCatalog } from "@/protocol/shapes/contribution/ShapeCatalog";

/** create 命令：图形类型名经 ShapeCatalog 查找，本类不含任何类型 switch。 */
export class CreateCommandContribution extends CommandContribution {
  public static create(shapeCatalog: ShapeCatalog): CommandContribution {
    return new CreateCommandContribution(shapeCatalog);
  }

  private constructor(private readonly shapeCatalog: ShapeCatalog) {
    super(
      "create",
      "create <type> <id> [params...] [in <containerId>]",
      new CommandHelp("create <type> <id> [params...]", "create a shape"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectMinimumLength(2);

    const shapeType = parameters.text(0, "shape type");
    const shapeId = parameters.text(1, "shape id");
    const parsedArguments = this.parseCreateArguments(parameters);
    const contribution = this.shapeCatalog.find(shapeType);

    if (contribution === undefined) {
      throw ProtocolError.shape(
        CommandErrorCode.UnknownShapeType,
        `unknown shape type: ${shapeType} (is the plugin loaded?)`,
      );
    }

    const shape = contribution.createShape(shapeId, parsedArguments.values);
    return new CreateCommand(shape, parsedArguments.parentId);
  }

  private parseCreateArguments(parameters: CommandParameters): {
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
