import { TreeCommand } from "./TreeCommand";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class TreeCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "tree",
      "tree [id]",
      new CommandHelp("tree [id]", "show the shape tree"),
      (parameters) => {
        if (parameters.hasLength(0)) {
          return new TreeCommand();
        }

        parameters.expectLength(1);
        return new TreeCommand(parameters.text(0, "shape id"));
      },
    );
  }
}
