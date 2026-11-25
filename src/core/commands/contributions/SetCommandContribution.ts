import { SetCommand } from "../../../protocol/commands/shape/SetCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";
import { EditableAttributeParser } from "../EditableAttributeParser";

export class SetCommandContribution {
  public static create(
    attributeParser: EditableAttributeParser = new EditableAttributeParser(),
  ): CommandContribution {
    return new CommandContribution(
      "set",
      "set <id> <attribute> <value>",
      new CommandHelp(
        "set <id> <attribute> <value>",
        "set a shape attribute",
      ),
      (parameters) => {
        parameters.expectLength(3);
        const shapeId = parameters.text(0, "shape id");
        const attribute = attributeParser.parse(
          parameters.text(1, "attribute"),
        );
        const value = attributeParser.isNumeric(attribute)
          ? parameters.number(2)
          : parameters.rawText(2, "attribute value");

        return new SetCommand(shapeId, attribute, value);
      },
    );
  }
}
