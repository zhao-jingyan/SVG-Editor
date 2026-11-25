import { ScaleCommand } from "./ScaleCommand";
import { CommandContribution } from "../_common/contribution/CommandContribution";
import { CommandHelp } from "../_common/contribution/CommandHelp";

export class ScaleCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "scale",
      "scale <id> <factor>",
      new CommandHelp("scale <id> <factor>", "scale a shape"),
      (parameters) => {
        parameters.expectLength(2);
        return new ScaleCommand(
          parameters.text(0, "shape id"),
          parameters.number(1),
        );
      },
    );
  }
}
