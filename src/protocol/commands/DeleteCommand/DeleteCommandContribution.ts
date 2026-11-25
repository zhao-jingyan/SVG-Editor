import { DeleteCommand } from "./DeleteCommand";
import { CommandContribution } from "../../contribution/CommandContribution";
import { CommandHelp } from "../../contribution/CommandHelp";

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
