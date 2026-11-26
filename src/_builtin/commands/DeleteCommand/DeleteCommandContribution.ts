import { DeleteCommand } from "./DeleteCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class DeleteCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new DeleteCommandContribution();
  }

  private constructor() {
    super(
      "delete",
      "delete <id>",
      new CommandHelp("delete <id>", "delete a shape and its subtree"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(1);
    return new DeleteCommand(parameters.text(0, "shape id"));
  }
}
