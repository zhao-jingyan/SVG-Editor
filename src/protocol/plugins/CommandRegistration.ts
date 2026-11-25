import type { Command } from "../commands/Command";
import type { CommandHelp } from "./CommandHelp";

export class CommandRegistration {
  public constructor(
    private readonly name: string,
    private readonly usage: string,
    private readonly help: CommandHelp | undefined,
    private readonly commandFactory: (
      tokens: readonly string[],
    ) => Command,
  ) {
    if (name.trim().length === 0 || usage.trim().length === 0) {
      throw new Error("command registration requires name and usage");
    }
  }

  public getName(): string {
    return this.name;
  }

  public parse(tokens: readonly string[]): Command {
    return this.commandFactory(tokens);
  }

  public getHelp(): CommandHelp | undefined {
    return this.help;
  }

  public getUsage(): string {
    return this.usage;
  }
}
