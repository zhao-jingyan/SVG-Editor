import { ReadCommand } from "./ReadCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class ReadCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new ReadCommandContribution();
  }

  private constructor() {
    super(
      "read",
      "read <file.svg>",
      new CommandHelp("read <file.svg>", "read an SVG file"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(1);
    return new ReadCommand(parameters.text(0, "file path"));
  }
}
