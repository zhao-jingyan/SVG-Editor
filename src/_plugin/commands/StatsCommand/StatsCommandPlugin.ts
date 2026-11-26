import type { PluginContext } from "@/protocol/plugins/PluginContext";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";
import { StatsCommandContribution } from "./StatsCommandContribution";

/** stats 命令插件。 */
export class StatsCommandPlugin implements SvgPlugin {
  public readonly name = "@svgframe/plugin-command-stats";

  public activate(context: PluginContext): void {
    context.registerCommand(StatsCommandContribution.create());
  }
}

export default StatsCommandPlugin;
