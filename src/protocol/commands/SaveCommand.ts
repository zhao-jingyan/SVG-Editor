import { Command } from "../Command";
import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../CommandResult";

export class SaveCommand extends Command {
  public readonly type = "save";

  public constructor(private readonly path?: string) {
    super();
  }

  public execute(context: CommandContext): Promise<CommandResult> {
    return context.save(this.path);
  }
}
