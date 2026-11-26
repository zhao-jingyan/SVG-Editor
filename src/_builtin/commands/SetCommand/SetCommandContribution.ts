import { SetCommand } from "./SetCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { EditableAttributeParser } from "./EditableAttributeParser";

export class SetCommandContribution extends CommandContribution {
  public static create(
    attributeParser: EditableAttributeParser = new EditableAttributeParser(),
  ): CommandContribution {
    return new SetCommandContribution(attributeParser);
  }

  private constructor(private readonly attributeParser: EditableAttributeParser) {
    super(
      "set",
      "set <id> <attribute> <value>",
      new CommandHelp("set <id> <attribute> <value>", "set a shape attribute"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(3);
    const shapeId = parameters.text(0, "shape id");
    const attribute = parameters.text(1, "attribute");
    const value = this.attributeParser.isNumeric(attribute)
      ? parameters.number(2)
      : parameters.rawText(2, "attribute value");

    return new SetCommand(shapeId, attribute, value);
  }
}
