import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";

export abstract class Command {
  public abstract execute(receiver: CommandReceiver): Promise<CommandResult>;
}
