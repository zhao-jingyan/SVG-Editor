import { MoveCommand } from "./MoveCommand";
import { CommandContribution } from "../../contribution/CommandContribution";
import { CommandHelp } from "../../contribution/CommandHelp";

export class MoveCommandContribution {
  public static create(): CommandContribution {
    return new CommandContribution(
      "move",
      "move <id> <dx> <dy>",
      new CommandHelp("move <id> <dx> <dy>", "move a shape"),
      (parameters) => {
        parameters.expectLength(3);
        const shapeId = parameters.text(0, "shape id");
        const numbers = parameters.numbers(1, 2);
        return new MoveCommand(shapeId, numbers[0], numbers[1]);
      },
    );
  }
}
