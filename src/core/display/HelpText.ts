import type { CommandCatalog } from "../../protocol/plugins/CommandCatalog";
import type { HelpTextProvider } from "../../protocol/plugins/HelpTextProvider";

export class HelpText implements HelpTextProvider {
  public constructor(private readonly commands: CommandCatalog) {}

  public render(): string {
    const entries = this.commands
      .getRegistrations()
      .flatMap((registration) => {
        const help = registration.getHelp();
        return help === undefined
          ? []
          : [{ usage: help.getUsage(), description: help.getDescription() }];
      });
    const usageWidth = entries.reduce(
      (width, entry) => Math.max(width, entry.usage.length),
      0,
    );
    const descriptionColumnWidth = usageWidth + 6;

    return [
      "Commands:",
      ...entries.map(
        (entry) =>
          `  ${entry.usage.padEnd(descriptionColumnWidth)}${entry.description}`,
      ),
    ].join("\n");
  }
}
