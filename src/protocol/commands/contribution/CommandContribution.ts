import { Command } from "@/protocol/commands/Command";
import type { CommandHelp } from "./CommandHelp";
import type { CommandParameters } from "./CommandParameters";

/**
 * 命令扩展点（抽象类）：一条命令的名称、usage、可选 help，以及参数 → Command 的工厂。
 * 内置命令与插件命令都继承它；内核只依赖这个抽象，经 CommandRegistry 按名字分派。
 *
 * 模板方法：createCommand 负责统一的契约校验，子类只实现 buildCommand。
 */
export abstract class CommandContribution {
  protected constructor(
    private readonly name: string,
    private readonly usage: string,
    private readonly help: CommandHelp | undefined,
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
    const command = this.buildCommand(parameters);

    if (!(command instanceof Command)) {
      throw new Error(
        `command factory for "${this.name}" must return a Command instance`,
      );
    }

    return command;
  }

  /** 校验参数并构造具体 Command；参数不合法时抛 ProtocolError。 */
  protected abstract buildCommand(parameters: CommandParameters): Command;
}
