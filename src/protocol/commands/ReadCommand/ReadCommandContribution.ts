import { ReadCommand } from "./ReadCommand";
import { CommandContribution } from "../_common/contribution/CommandContribution";
import { CommandHelp } from "../_common/contribution/CommandHelp";

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
