import { SetCommand } from "../../../protocol/commands/shape/SetCommand";
import type { CommandParameters } from "../../../protocol/contribution/CommandParameters";
import { CommandErrorCode } from "../../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../../protocol/errors/ProtocolError";
import type { EditableAttribute } from "../../../protocol/shapes/model/EditableAttribute";

/**
 * 暂留 set 参数解释；下一提交迁入贡献工厂后删除。
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

  public parseSet(parameters: CommandParameters): SetCommand {
    parameters.expectLength(3);
    const shapeId = parameters.text(0, "shape id");
    const attribute = this.parseAttribute(parameters.text(1, "attribute"));
    const value = ShapeCommandParser.numericAttributes.has(attribute)
      ? parameters.number(2)
      : parameters.rawText(2, "attribute value");

    return new SetCommand(shapeId, attribute, value);
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
