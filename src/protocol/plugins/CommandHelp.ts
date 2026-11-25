export class CommandHelp {
  public constructor(
    private readonly usage: string,
    private readonly description: string,
  ) {
    if (usage.trim().length === 0 || description.trim().length === 0) {
      throw new Error("command help requires usage and description");
    }
  }

  public getUsage(): string {
    return this.usage;
  }

  public getDescription(): string {
    return this.description;
  }
}
