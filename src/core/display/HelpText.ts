import type { CommandCatalog } from "@/protocol/commands/_common/contribution/CommandCatalog";

/**
 * 从命令目录渲染 Phase 1 help 文本。
 */
export class HelpText {
  private static readonly usageColumnWidth = 36;

  public constructor(private readonly catalog: CommandCatalog) {}

  public render(): string {
    const lines = ["Commands:"];

    for (const contribution of this.catalog.getContributions()) {
      const help = contribution.getHelp();

      if (help === undefined) {
        continue;
      }

      lines.push(
        `  ${help.getUsage().padEnd(HelpText.usageColumnWidth)}${help.getDescription()}`,
      );
    }

    return lines.join("\n");
  }
}
