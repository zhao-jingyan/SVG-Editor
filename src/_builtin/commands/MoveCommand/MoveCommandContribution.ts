import { MoveCommand } from "./MoveCommand";
import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

export class MoveCommandContribution extends CommandContribution {
  public static create(): CommandContribution {
    return new MoveCommandContribution();
  }

  private constructor() {
    super(
      "move",
      "move <id> <dx> <dy>",
      new CommandHelp("move <id> <dx> <dy>", "move a shape"),
    );
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(3);
    const shapeId = parameters.text(0, "shape id");
    const numbers = parameters.numbers(1, 2);
    return new MoveCommand(shapeId, numbers[0], numbers[1]);
  }
}
