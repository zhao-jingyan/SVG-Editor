import { Command } from "../Command";
import type { CommandReceiver } from "../../CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class CanvasCommand extends Command {
  public readonly type = "canvas";

  public constructor(
    private readonly width?: number,
    private readonly height?: number,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.canvas(this.width, this.height);
  }
}
