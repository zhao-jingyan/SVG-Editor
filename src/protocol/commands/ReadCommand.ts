import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";

export class ReadCommand extends Command {
  public readonly type = "read";

  public constructor(private readonly path: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.read(this.path);
  }
}
