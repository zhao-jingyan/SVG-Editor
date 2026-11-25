import { PluginContributes } from "@/protocol/plugins/PluginContributes";
import { DirCommandPlugin } from "@/_plugin/commands/DirCommand/DirCommandPlugin";
import { StatsCommandPlugin } from "@/_plugin/commands/StatsCommand/StatsCommandPlugin";
import { BoxShapePlugin } from "@/_plugin/shapes/BoxShape/BoxShapePlugin";
import { ModifiedStarPlugin } from "@/_plugin/tree/ModifiedStarPlugin";
import type { PluginHost } from "./PluginHost";

/**
 * 方式 A：组合根显式 activate；与方式 B 共用 PluginHost 注册路径。
 * 顺序：命令 → box（含 (box) 标签）→ modified-star，保证树行 ` (box) *`。
 */
export async function activateDefaultPlugins(host: PluginHost): Promise<void> {
  await host.activate(
    new StatsCommandPlugin(),
    PluginContributes.of({ commands: ["stats"] }),
  );
  await host.activate(
    new DirCommandPlugin(),
    PluginContributes.of({ commands: ["dir"] }),
  );
  await host.activate(
    new BoxShapePlugin(),
    PluginContributes.of({
      shapes: ["box"],
      attributes: ["box-attributes"],
      decorators: ["box-type-label"],
    }),
  );
  await host.activate(
    new ModifiedStarPlugin(),
    PluginContributes.of({ decorators: ["modified-star"] }),
  );
}
