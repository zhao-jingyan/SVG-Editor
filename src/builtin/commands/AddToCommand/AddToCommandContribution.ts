import { AddToCommand } from "./AddToCommand";
import { CommandContribution } from "../../../protocol/commands/_common/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/commands/_common/contribution/CommandHelp";

export class AddToCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "addto",
      "addto <gid> <id>",
      new CommandHelp("addto <gid> <id>", "move a shape into a container"),
      (parameters) => {
        parameters.expectLength(2);
        return new AddToCommand(
          parameters.text(0, "container id"),
          parameters.text(1, "shape id"),
        );
      },
    );
  }
}
