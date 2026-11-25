import { ReorderCommand } from "./ReorderCommand";
import { CommandContribution } from "../../contribution/CommandContribution";
import { CommandHelp } from "../../contribution/CommandHelp";

export class FrontCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "front",
      "front <id>",
      new CommandHelp("front <id> | back <id>", "change z-order"),
      (parameters) => {
        parameters.expectLength(1);
        return new ReorderCommand(
          parameters.text(0, "shape id"),
          "front",
        );
      },
    );
  }
}
