import { ReorderCommand } from "./ReorderCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";

export class BackCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new BackCommandContribution();
  }

  private constructor() {
    super(
      "back",
      "back <id>",
      undefined,
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(1);
    return new ReorderCommand(
      parameters.text(0, "shape id"),
      "back",
    );
  }
}
