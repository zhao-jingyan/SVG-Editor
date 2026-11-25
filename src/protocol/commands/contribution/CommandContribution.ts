import { Command } from "@/protocol/commands/Command";
import type { CommandHelp } from "./CommandHelp";
import type { CommandParameters } from "./CommandParameters";

/**
 * 一条命令的贡献对象：名称、usage、可选 help，以及 Command 工厂。
 */
export class CommandContribution {
  public constructor(
    private readonly name: string,
    private readonly usage: string,
    private readonly help: CommandHelp | undefined,
    private readonly commandFactory: (
      parameters: CommandParameters,
    ) => Command,
  ) {
    if (name.trim().length === 0) {
      throw new Error("command name must not be empty");
    }

    if (usage.trim().length === 0) {
      throw new Error("command usage must not be empty");
    }
  }

  public getName(): string {
    return this.name;
  }

  public getUsage(): string {
    return this.usage;
  }

  public getHelp(): CommandHelp | undefined {
    return this.help;
  }

  public createCommand(parameters: CommandParameters): Command {
    const command = this.commandFactory(parameters);

    if (!(command instanceof Command)) {
      throw new Error(
        `command factory for "${this.name}" must return a Command instance`,
      );
    }

    return command;
  }
}
