import { CanvasCommand } from "./CanvasCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class CanvasCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new CanvasCommandContribution();
  }

  private constructor() {
    super(
      "canvas",
      "canvas [width height]",
      new CommandHelp(
      "canvas [width height]",
      "show or resize the canvas",
    ),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    if (parameters.hasLength(0)) {
      return new CanvasCommand();
    }

    parameters.expectLength(2);
    const dimensions = parameters.numbers(0, 2);
    return new CanvasCommand(dimensions[0], dimensions[1]);
  }
}
