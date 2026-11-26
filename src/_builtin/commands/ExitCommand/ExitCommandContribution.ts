import { ExitCommand } from "./ExitCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class ExitCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new ExitCommandContribution();
  }

  private constructor() {
    super(
      "exit",
      "exit",
      new CommandHelp("exit", "leave the editor"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(0);
    return new ExitCommand();
  }
}
