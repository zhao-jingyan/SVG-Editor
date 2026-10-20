import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";

export class CanvasCommand extends Command {
  public readonly type = "canvas";

  public constructor(
    private readonly width?: number,
    private readonly height?: number,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.canvas(this.width, this.height);
  }
}
