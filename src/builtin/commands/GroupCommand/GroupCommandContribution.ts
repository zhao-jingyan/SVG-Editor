import { GroupCommand } from "./GroupCommand";
import { CommandContribution } from "@/protocol/commands/_common/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/_common/contribution/CommandHelp";

export class GroupCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "group",
      "group <newGid> <id1> <id2>...",
      new CommandHelp(
        "group <newGid> <id1> <id2>...",
        "group existing shapes",
      ),
      (parameters) => {
        parameters.expectMinimumLength(3);
        const containerId = parameters.text(0, "container id");
        const memberIds: string[] = [];

        for (let index = 1; index < parameters.length; index += 1) {
          memberIds.push(parameters.text(index, "member id"));
        }

        return new GroupCommand(containerId, memberIds);
      },
    );
  }
}
