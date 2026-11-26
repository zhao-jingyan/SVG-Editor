import { AddToCommand } from "./AddToCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class AddToCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new AddToCommandContribution();
  }

  private constructor() {
    super(
      "addto",
      "addto <gid> <id>",
      new CommandHelp("addto <gid> <id>", "move a shape into a container"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(2);
    return new AddToCommand(
      parameters.text(0, "container id"),
      parameters.text(1, "shape id"),
    );
  }
}
