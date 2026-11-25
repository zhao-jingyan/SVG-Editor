import { ExitCommand } from "./ExitCommand";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

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
