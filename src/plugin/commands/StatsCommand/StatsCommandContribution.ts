import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import { StatsCommand } from "./StatsCommand";

export class StatsCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "stats",
      "stats",
      new CommandHelp("stats", "count shapes on the canvas"),
      (parameters) => {
        parameters.expectLength(0);
        return new StatsCommand();
      },
    );
  }
}
