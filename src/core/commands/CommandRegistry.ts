import type { CommandCatalog } from "@/protocol/commands/contribution/CommandCatalog";
import type { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";

/**
 * 运行时命令注册表：维护插入顺序并拒绝同名命令。
 */
export class CommandRegistry implements CommandCatalog {
  private readonly contributions: CommandContribution[] = [];
  private readonly byName = new Map<string, CommandContribution>();

  public register(contribution: CommandContribution): void {
    const name = contribution.getName();

    if (this.byName.has(name)) {
      throw new Error(`duplicate command: ${name}`);
    }

    this.byName.set(name, contribution);
    this.contributions.push(contribution);
  }

  public registerAll(contributions: readonly CommandContribution[]): void {
    for (const contribution of contributions) {
      this.register(contribution);
    }
  }

  public find(commandName: string): CommandContribution | undefined {
    return this.byName.get(commandName);
  }

  public getContributions(): readonly CommandContribution[] {
    return this.contributions;
  }
}
