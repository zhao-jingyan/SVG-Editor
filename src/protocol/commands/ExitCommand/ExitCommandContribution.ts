import { ExitCommand } from "./ExitCommand";
import { CommandContribution } from "../../contribution/CommandContribution";
import { CommandHelp } from "../../contribution/CommandHelp";

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
