import { UndoCommand } from "../../../protocol/commands/history/UndoCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";

export class UndoCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "undo",
      "undo",
      new CommandHelp("undo | redo", "undo or redo an edit"),
      (parameters) => {
        parameters.expectLength(0);
        return new UndoCommand();
      },
    );
  }
}
