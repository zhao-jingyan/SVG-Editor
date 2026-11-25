import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { EditableAttributeRules } from "@/protocol/attributes/EditableAttributeRules";
import type { EditableAttribute } from "@/protocol/shapes/model/EditableAttribute";

/**
 * set 命令用的属性名辅助；白名单本体在 protocol EditableAttributeRules。
 */
export class EditableAttributeParser {
  private readonly rules = new EditableAttributeRules();

  public isEditable(token: string): token is EditableAttribute {
    return this.rules.isEditable(token);
  }

  public parse(token: string): EditableAttribute {
    if (!this.isEditable(token)) {
      throw ProtocolError.commandParse(
        CommandErrorCode.UnknownAttribute,
        `unknown attribute: ${token}`,
      );
    }

    return token;
  }

  public isNumeric(attribute: string): boolean {
    return this.rules.isNumeric(attribute);
  }
}
