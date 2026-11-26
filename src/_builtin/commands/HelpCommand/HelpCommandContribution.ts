import { HelpCommand } from "./HelpCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class HelpCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new HelpCommandContribution();
  }

  private constructor() {
    super(
      "help",
      "help",
      new CommandHelp("help", "show this help"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(0);
    return new HelpCommand();
  }
}
