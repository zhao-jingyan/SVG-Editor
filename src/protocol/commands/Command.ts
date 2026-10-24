import type { CommandReceiver } from "../CommandReceiver";
import type { CommandResult } from "../results/CommandResult";
import type { CommandType } from "./CommandType";

export abstract class Command {
  public abstract readonly type: CommandType;

  public abstract execute(receiver: CommandReceiver): Promise<CommandResult>;
}
