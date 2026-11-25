import { ExitCommand } from "../../../protocol/commands/session/ExitCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";

export class ExitCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "exit",
      "exit",
      new CommandHelp("exit", "leave the editor"),
      (parameters) => {
        parameters.expectLength(0);
        return new ExitCommand();
      },
    );
  }
}
