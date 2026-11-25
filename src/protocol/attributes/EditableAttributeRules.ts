import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { EditableAttribute } from "@/protocol/shapes/model/EditableAttribute";

/** Phase 1 属性白名单：无 AttributeHandler 命中时的回退规则。 */
export class EditableAttributeRules {
  private static readonly editableAttributes = new Set<string>([
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

  private static readonly numericAttributes = new Set<string>([
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

  public isEditable(token: string): token is EditableAttribute {
    return EditableAttributeRules.editableAttributes.has(token);
  }

  public requireEditable(token: string): EditableAttribute {
    if (!this.isEditable(token)) {
      throw ProtocolError.shape(
        CommandErrorCode.UnknownAttribute,
        `unknown attribute: ${token}`,
      );
    }

    return token;
  }

  public isNumeric(attribute: string): boolean {
    return EditableAttributeRules.numericAttributes.has(attribute);
  }
}
