import { SaveCommand } from "./SaveCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class SaveCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new SaveCommandContribution();
  }

  private constructor() {
    super(
      "save",
      "save [file.svg]",
      new CommandHelp("save [file.svg]", "save the current document"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    if (parameters.hasLength(0)) {
      return new SaveCommand();
    }

    parameters.expectLength(1);
    return new SaveCommand(parameters.text(0, "file path"));
  }
}
