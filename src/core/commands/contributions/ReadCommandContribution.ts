import { ReadCommand } from "../../../protocol/commands/doc/ReadCommand";
import { CommandContribution } from "../../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/contribution/CommandHelp";

export class ReadCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "read",
      "read <file.svg>",
      new CommandHelp("read <file.svg>", "read an SVG file"),
      (parameters) => {
        parameters.expectLength(1);
        return new ReadCommand(parameters.text(0, "file path"));
      },
    );
  }
}
