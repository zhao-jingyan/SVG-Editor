import { GroupCommand } from "./GroupCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class GroupCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new GroupCommandContribution();
  }

  private constructor() {
    super(
      "group",
      "group <newGid> <id1> <id2>...",
      new CommandHelp(
      "group <newGid> <id1> <id2>...",
      "group existing shapes",
    ),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectMinimumLength(3);
    const containerId = parameters.text(0, "container id");
    const memberIds: string[] = [];

    for (let index = 1; index < parameters.length; index += 1) {
      memberIds.push(parameters.text(index, "member id"));
    }

    return new GroupCommand(containerId, memberIds);
  }
}
