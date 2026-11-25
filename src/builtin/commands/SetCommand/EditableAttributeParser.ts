import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { EditableAttribute } from "@/protocol/shapes/model/EditableAttribute";

/**
 * 仅服务 set 命令的属性名与数值属性判定。
 */
export class EditableAttributeParser {
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

  public parse(token: string): EditableAttribute {
    if (
      !EditableAttributeParser.editableAttributes.has(
        token as EditableAttribute,
      )
    ) {
      throw ProtocolError.commandParse(
        CommandErrorCode.UnknownAttribute,
        `unknown attribute: ${token}`,
      );
    }

    return token as EditableAttribute;
  }

  public isNumeric(attribute: EditableAttribute): boolean {
    return EditableAttributeParser.numericAttributes.has(attribute);
  }
}
