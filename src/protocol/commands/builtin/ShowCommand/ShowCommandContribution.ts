import { ShowCommand } from "./ShowCommand";
import { CommandContribution } from "../../_common/contribution/CommandContribution";
import { CommandHelp } from "../../_common/contribution/CommandHelp";

export class ShowCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "show",
      "show <id>",
      new CommandHelp("show <id>", "show shape attributes"),
      (parameters) => {
        parameters.expectLength(1);
        return new ShowCommand(parameters.text(0, "shape id"));
      },
    );
  }
}
