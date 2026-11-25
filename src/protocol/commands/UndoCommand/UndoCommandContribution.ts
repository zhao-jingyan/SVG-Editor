import { UndoCommand } from "./UndoCommand";
import { CommandContribution } from "../../contribution/CommandContribution";
import { CommandHelp } from "../../contribution/CommandHelp";

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
