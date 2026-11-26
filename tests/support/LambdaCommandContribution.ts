import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";

/** 测试替身：以闭包实现 CommandContribution 抽象类，便于构造任意命令贡献。 */
export class LambdaCommandContribution extends CommandContribution {
  public constructor(
    name: string,
    usage: string,
    help: CommandHelp | undefined,
    private readonly factory: (parameters: CommandParameters) => Command,
  ) {
    super(name, usage, help);
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    return this.factory(parameters);
  }
}
