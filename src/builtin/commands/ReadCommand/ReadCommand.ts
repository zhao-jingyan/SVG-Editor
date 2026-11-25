import { Command } from "@/protocol/commands/Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";

export class ReadCommand extends Command {
  public constructor(private readonly path: string) {
    super();
  }

  public execute(receiver: CommandReceiver): Promise<CommandResult> {
    return receiver.read(this.path);
  }
}
