import { ShowCommand } from "./ShowCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class ShowCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new ShowCommandContribution();
  }

  private constructor() {
    super(
      "show",
      "show <id>",
      new CommandHelp("show <id>", "show shape attributes"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(1);
    return new ShowCommand(parameters.text(0, "shape id"));
  }
}
