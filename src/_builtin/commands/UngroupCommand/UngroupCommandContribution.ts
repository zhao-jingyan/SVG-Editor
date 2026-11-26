import { UngroupCommand } from "./UngroupCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class UngroupCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new UngroupCommandContribution();
  }

  private constructor() {
    super(
      "ungroup",
      "ungroup <gid>",
      new CommandHelp("ungroup <gid>", "ungroup a container"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(1);
    return new UngroupCommand(parameters.text(0, "container id"));
  }
}
