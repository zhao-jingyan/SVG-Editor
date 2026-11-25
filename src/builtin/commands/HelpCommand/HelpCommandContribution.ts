import { HelpCommand } from "./HelpCommand";
import { CommandContribution } from "@/protocol/commands/_common/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/_common/contribution/CommandHelp";

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
