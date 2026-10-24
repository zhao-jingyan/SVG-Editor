import { AddToCommand } from "../../../../../protocol/commands/shape/AddToCommand";
import { DeleteCommand } from "../../../../../protocol/commands/shape/DeleteCommand";
import { GroupCommand } from "../../../../../protocol/commands/shape/GroupCommand";
import { MoveCommand } from "../../../../../protocol/commands/shape/MoveCommand";
import { ReorderCommand } from "../../../../../protocol/commands/shape/ReorderCommand";
import { ScaleCommand } from "../../../../../protocol/commands/shape/ScaleCommand";
import { SetCommand } from "../../../../../protocol/commands/shape/SetCommand";
import { UngroupCommand } from "../../../../../protocol/commands/shape/UngroupCommand";
import { CommandErrorCode } from "../../../../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../../../../protocol/errors/ProtocolError";
import type { EditableAttribute } from "../../../../../protocol/shapes/model/EditableAttribute";
import type { CommandArguments } from "../../../syntax/CommandArguments";

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

  public parseDelete(args: CommandArguments): DeleteCommand {
    args.expectLength(2);
    return new DeleteCommand(args.text(1, "shape id"));
  }

  public parseMove(args: CommandArguments): MoveCommand {
    args.expectLength(4);
    const shapeId = args.text(1, "shape id");
    const numbers = args.numbers(2, 2);
    return new MoveCommand(shapeId, numbers[0], numbers[1]);
  }

  public parseScale(args: CommandArguments): ScaleCommand {
    args.expectLength(3);
    return new ScaleCommand(
      args.text(1, "shape id"),
      args.number(2),
    );
  }

  public parseSet(args: CommandArguments): SetCommand {
    args.expectLength(4);
    const shapeId = args.text(1, "shape id");
    const attribute = this.parseAttribute(args.text(2, "attribute"));
    const value = ShapeCommandParser.numericAttributes.has(attribute)
      ? args.number(3)
      : args.rawText(3, "attribute value");

    return new SetCommand(shapeId, attribute, value);
  }

  public parseGroup(args: CommandArguments): GroupCommand {
    args.expectMinimumLength(4);
    const containerId = args.text(1, "container id");
    const memberIds: string[] = [];

    for (let index = 2; index < args.length; index += 1) {
      memberIds.push(args.text(index, "member id"));
    }

    return new GroupCommand(containerId, memberIds);
  }

  public parseUngroup(args: CommandArguments): UngroupCommand {
    args.expectLength(2);
    return new UngroupCommand(args.text(1, "container id"));
  }

  public parseAddTo(args: CommandArguments): AddToCommand {
    args.expectLength(3);
    return new AddToCommand(
      args.text(1, "container id"),
      args.text(2, "shape id"),
    );
  }

  public parseReorder(
    args: CommandArguments,
    position: "front" | "back",
  ): ReorderCommand {
    args.expectLength(2);
    return new ReorderCommand(
      args.text(1, "shape id"),
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
