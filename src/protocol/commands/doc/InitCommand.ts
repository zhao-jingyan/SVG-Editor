import { Command } from "../../Command";
import type { CommandContext } from "../../CommandContext";
import type { CommandResult } from "../../results/CommandResult";

export class InitCommand extends Command {
  public readonly type = "init";

  public constructor(
    private readonly width?: number,
    private readonly height?: number,
  ) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.init(this.width, this.height);
  }
}
