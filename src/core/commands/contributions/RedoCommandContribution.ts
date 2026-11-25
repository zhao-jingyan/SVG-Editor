import { RedoCommand } from "../../../protocol/commands/history/RedoCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";

export class RedoCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "redo",
      "redo",
      undefined,
      (parameters) => {
        parameters.expectLength(0);
        return new RedoCommand();
      },
    );
  }
}
