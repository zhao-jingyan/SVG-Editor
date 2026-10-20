import type { Command } from "../protocol/Command";
import type { CommandResult } from "../protocol/CommandResult";
import type { Executor } from "./Executor";

export class DemoExecutor implements Executor {
  public async execute(command: Command): Promise<CommandResult> {
    if (command.type === "exit") {
      return { type: "exit" };
    }

    return { type: "success", message: `received command: ${command.type}` };
  }
}
