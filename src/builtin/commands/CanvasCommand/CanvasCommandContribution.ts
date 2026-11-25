import { CanvasCommand } from "./CanvasCommand";
import { CommandContribution } from "../../../protocol/commands/_common/contribution/CommandContribution";
import { CommandHelp } from "../../../protocol/commands/_common/contribution/CommandHelp";

export class CanvasCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "canvas",
      "canvas [width height]",
      new CommandHelp(
        "canvas [width height]",
        "show or resize the canvas",
      ),
      (parameters) => {
        if (parameters.hasLength(0)) {
          return new CanvasCommand();
        }

        parameters.expectLength(2);
        const dimensions = parameters.numbers(0, 2);
        return new CanvasCommand(dimensions[0], dimensions[1]);
      },
    );
  }
}
