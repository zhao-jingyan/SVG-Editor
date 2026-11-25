import { Command } from "../../../protocol/commands/_common/Command";
import type { CommandReceiver } from "../../../protocol/receivers/CommandReceiver";
import type { CommandResult } from "../../../protocol/results/CommandResult";

export class InitCommand extends Command {
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
