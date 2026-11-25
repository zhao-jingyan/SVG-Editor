import { InitCommand } from "./InitCommand";
import { CommandContribution } from "../../_common/contribution/CommandContribution";
import { CommandHelp } from "../../_common/contribution/CommandHelp";

export class InitCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "init",
      "init [width height]",
      new CommandHelp(
        "init [width height]",
        "create a new canvas (default 800x600)",
      ),
      (parameters) => {
        if (parameters.hasLength(0)) {
          return new InitCommand();
        }

        parameters.expectLength(2);
        const dimensions = parameters.numbers(0, 2);
        return new InitCommand(dimensions[0], dimensions[1]);
      },
    );
  }
}
