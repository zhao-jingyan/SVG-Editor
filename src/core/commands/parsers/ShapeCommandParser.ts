import { AddToCommand } from "../../../protocol/commands/shape/AddToCommand";
import { DeleteCommand } from "../../../protocol/commands/shape/DeleteCommand";
import { GroupCommand } from "../../../protocol/commands/shape/GroupCommand";
import { MoveCommand } from "../../../protocol/commands/shape/MoveCommand";
import { ReorderCommand } from "../../../protocol/commands/shape/ReorderCommand";
import { ScaleCommand } from "../../../protocol/commands/shape/ScaleCommand";
import { SetCommand } from "../../../protocol/commands/shape/SetCommand";
import { UngroupCommand } from "../../../protocol/commands/shape/UngroupCommand";
import type { CommandParameters } from "../../../protocol/contribution/CommandParameters";
import { CommandErrorCode } from "../../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../../protocol/errors/ProtocolError";
import type { EditableAttribute } from "../../../protocol/shapes/model/EditableAttribute";

/**
 * 构造除 create 以外的图形编辑命令。
 */
export class ShapeCommandParser {
  private static readonly editableAttributes = new Set<EditableAttribute>([
    "fill",
    "stroke",
    "stroke-width",
    "x",
    "y",
    "width",
    "height",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x1",
    "y1",
    "x2",
    "y2",
    "text",
  ]);

  private static readonly numericAttributes = new Set<EditableAttribute>([
    "stroke-width",
    "x",
    "y",
    "width",
    "height",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x1",
    "y1",
    "x2",
    "y2",
  ]);

  public parseDelete(parameters: CommandParameters): DeleteCommand {
    parameters.expectLength(1);
    return new DeleteCommand(parameters.text(0, "shape id"));
  }

  public parseMove(parameters: CommandParameters): MoveCommand {
    parameters.expectLength(3);
    const shapeId = parameters.text(0, "shape id");
    const numbers = parameters.numbers(1, 2);
    return new MoveCommand(shapeId, numbers[0], numbers[1]);
  }

  public parseScale(parameters: CommandParameters): ScaleCommand {
    parameters.expectLength(2);
    return new ScaleCommand(
      parameters.text(0, "shape id"),
      parameters.number(1),
    );
  }

  public parseSet(parameters: CommandParameters): SetCommand {
    parameters.expectLength(3);
    const shapeId = parameters.text(0, "shape id");
    const attribute = this.parseAttribute(parameters.text(1, "attribute"));
    const value = ShapeCommandParser.numericAttributes.has(attribute)
      ? parameters.number(2)
      : parameters.rawText(2, "attribute value");

    return new SetCommand(shapeId, attribute, value);
  }

  public parseGroup(parameters: CommandParameters): GroupCommand {
    parameters.expectMinimumLength(3);
    const containerId = parameters.text(0, "container id");
    const memberIds: string[] = [];

    for (let index = 1; index < parameters.length; index += 1) {
      memberIds.push(parameters.text(index, "member id"));
    }

    return new GroupCommand(containerId, memberIds);
  }

  public parseUngroup(parameters: CommandParameters): UngroupCommand {
    parameters.expectLength(1);
    return new UngroupCommand(parameters.text(0, "container id"));
  }

  public parseAddTo(parameters: CommandParameters): AddToCommand {
    parameters.expectLength(2);
    return new AddToCommand(
      parameters.text(0, "container id"),
      parameters.text(1, "shape id"),
    );
  }

  public parseReorder(
    parameters: CommandParameters,
    position: "front" | "back",
  ): ReorderCommand {
    parameters.expectLength(1);
    return new ReorderCommand(
      parameters.text(0, "shape id"),
      position,
    );
  }

  private parseAttribute(token: string): EditableAttribute {
    if (!ShapeCommandParser.editableAttributes.has(token as EditableAttribute)) {
      throw ProtocolError.commandParse(
        CommandErrorCode.UnknownAttribute,
        `unknown attribute: ${token}`,
      );
    }

    return token as EditableAttribute;
  }
}
