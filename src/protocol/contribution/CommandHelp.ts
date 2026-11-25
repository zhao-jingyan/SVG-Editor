/**
 * 封装单条命令在 help 输出中的 usage 与描述。
 */
export class CommandHelp {
  public constructor(
    private readonly usage: string,
    private readonly description: string,
  ) {
    if (usage.trim().length === 0) {
      throw new Error("command help usage must not be empty");
    }

    if (description.trim().length === 0) {
      throw new Error("command help description must not be empty");
    }
  }

  public getUsage(): string {
    return this.usage;
  }

  public getDescription(): string {
    return this.description;
  }
}
