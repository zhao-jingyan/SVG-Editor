import { Command } from "../Command";
import type { CommandReceiver } from "../../CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class InitCommand extends Command {
  public readonly type = "init";

  public constructor(
    private readonly width?: number,
    private readonly height?: number,
  ) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.init(this.width, this.height);
  }
}
