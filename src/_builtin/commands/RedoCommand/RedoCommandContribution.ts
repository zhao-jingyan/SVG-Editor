import { RedoCommand } from "./RedoCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";

export class RedoCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new RedoCommandContribution();
  }

  private constructor() {
    super(
      "redo",
      "redo",
      undefined,
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(0);
    return new RedoCommand();
  }
}
