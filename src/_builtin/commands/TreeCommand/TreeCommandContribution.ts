import { TreeCommand } from "./TreeCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class TreeCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new TreeCommandContribution();
  }

  private constructor() {
    super(
      "tree",
      "tree [id]",
      new CommandHelp("tree [id]", "show the shape tree"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    if (parameters.hasLength(0)) {
      return new TreeCommand();
    }

    parameters.expectLength(1);
    return new TreeCommand(parameters.text(0, "shape id"));
  }
}
