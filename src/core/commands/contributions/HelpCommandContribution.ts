import { HelpCommand } from "../../../protocol/commands/view/HelpCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";

export class HelpCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "help",
      "help",
      new CommandHelp("help", "show this help"),
      (parameters) => {
        parameters.expectLength(0);
        return new HelpCommand();
      },
    );
  }
}
