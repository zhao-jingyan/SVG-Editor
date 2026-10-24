import type { CommandContext } from "../CommandContext";
import type { CommandResult } from "../results/CommandResult";
import type { CommandType } from "./CommandType";

export abstract class Command {
  public abstract readonly type: CommandType;

  public abstract execute(context: CommandContext): Promise<CommandResult>;
}
