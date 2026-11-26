import { ScaleCommand } from "./ScaleCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class ScaleCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new ScaleCommandContribution();
  }

  private constructor() {
    super(
      "scale",
      "scale <id> <factor>",
      new CommandHelp("scale <id> <factor>", "scale a shape"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(2);
    return new ScaleCommand(
      parameters.text(0, "shape id"),
      parameters.number(1),
    );
  }
}
