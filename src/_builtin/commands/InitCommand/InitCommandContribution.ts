import { InitCommand } from "./InitCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class InitCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new InitCommandContribution();
  }

  private constructor() {
    super(
      "init",
      "init [width height]",
      new CommandHelp(
      "init [width height]",
      "create a new canvas (default 800x600)",
    ),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    if (parameters.hasLength(0)) {
      return new InitCommand();
    }

    parameters.expectLength(2);
    const dimensions = parameters.numbers(0, 2);
    return new InitCommand(dimensions[0], dimensions[1]);
  }
}
