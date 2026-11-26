import { UndoCommand } from "./UndoCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class UndoCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new UndoCommandContribution();
  }

  private constructor() {
    super(
      "undo",
      "undo",
      new CommandHelp("undo | redo", "undo or redo an edit"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(0);
    return new UndoCommand();
  }
}
