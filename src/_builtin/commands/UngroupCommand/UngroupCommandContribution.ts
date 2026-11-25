import { UngroupCommand } from "./UngroupCommand";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class UngroupCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "ungroup",
      "ungroup <gid>",
      new CommandHelp("ungroup <gid>", "ungroup a container"),
      (parameters) => {
        parameters.expectLength(1);
        return new UngroupCommand(parameters.text(0, "container id"));
      },
    );
  }
}
