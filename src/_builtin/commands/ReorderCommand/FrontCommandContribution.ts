import { ReorderCommand } from "./ReorderCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class FrontCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new FrontCommandContribution();
  }

  private constructor() {
    super(
      "front",
      "front <id>",
      new CommandHelp("front <id> | back <id>", "change z-order"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(1);
    return new ReorderCommand(
      parameters.text(0, "shape id"),
      "front",
    );
  }
}
