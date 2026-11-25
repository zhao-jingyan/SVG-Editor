import { ExitCommand } from "./ExitCommand";
import { CommandContribution } from "../../../protocol/commands/_common/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/commands/_common/contribution/CommandHelp";

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
