import { Command } from "../Command";
import type { CommandReceiver } from "../../receivers/CommandReceiver";
import type { CommandResult } from "../../results/CommandResult";

export class ReadCommand extends Command {
  public readonly type = "read";

  public constructor(private readonly path: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.read(this.path);
  }
}
