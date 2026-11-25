import type { PluginContext } from "@/protocol/plugins/PluginContext";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";
import { ModifiedStarDecorator } from "./ModifiedStarDecorator";

/** modified-star 树标签插件。 */
export class ModifiedStarPlugin implements SvgPlugin {
  public readonly name = "@svgframe/plugin-tree-modified-star";

  public activate(context: PluginContext): void {
    context.registerDecorator(new ModifiedStarDecorator());
  }
}

export default ModifiedStarPlugin;
