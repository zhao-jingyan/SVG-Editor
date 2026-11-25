import { SaveCommand } from "./SaveCommand";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class SaveCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "save",
      "save [file.svg]",
      new CommandHelp("save [file.svg]", "save the current document"),
      (parameters) => {
        if (parameters.hasLength(0)) {
          return new SaveCommand();
        }

        parameters.expectLength(1);
        return new SaveCommand(parameters.text(0, "file path"));
      },
    );
  }
}
