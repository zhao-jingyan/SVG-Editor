import { DeleteCommand } from "../../../protocol/commands/shape/DeleteCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";

export class DeleteCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "delete",
      "delete <id>",
      new CommandHelp("delete <id>", "delete a shape and its subtree"),
      (parameters) => {
        parameters.expectLength(1);
        return new DeleteCommand(parameters.text(0, "shape id"));
      },
    );
  }
}
