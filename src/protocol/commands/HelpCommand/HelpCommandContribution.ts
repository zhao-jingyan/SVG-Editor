import { HelpCommand } from "./HelpCommand";
import { CommandContribution } from "../../contribution/CommandContribution";
import { CommandHelp } from "../../contribution/CommandHelp";

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
