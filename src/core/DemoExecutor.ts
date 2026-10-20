import type { Command } from "../protocol/Command";
import type { CommandContext } from "../protocol/CommandContext";
import type { CommandResult } from "../protocol/results/CommandResult";
import type { Executor } from "./Executor";

export class DemoExecutor implements Executor {
  public constructor(private readonly context: CommandContext) {}

  public execute(command: Command): Promise<CommandResult> {
    return command.execute(this.context);
  }
}
