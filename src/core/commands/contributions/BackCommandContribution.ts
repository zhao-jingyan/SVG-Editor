import { ReorderCommand } from "../../../protocol/commands/shape/ReorderCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";

export class BackCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "back",
      "back <id>",
      undefined,
      (parameters) => {
        parameters.expectLength(1);
        return new ReorderCommand(
          parameters.text(0, "shape id"),
          "back",
        );
      },
    );
  }
}
