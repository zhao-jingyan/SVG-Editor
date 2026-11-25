import type { CommandReceiver } from "../receivers/CommandReceiver";
import type { CommandResult } from "../results/CommandResult";

export abstract class Command {
  public abstract execute(receiver: CommandReceiver): Promise<CommandResult>;
}
