import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { StatsCommand } from "./StatsCommand";

export class StatsCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new StatsCommandContribution();
  }

  private constructor() {
    super("stats", "stats", new CommandHelp("stats", "count shapes on the canvas"));
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(0);
    return new StatsCommand();
  }
}
