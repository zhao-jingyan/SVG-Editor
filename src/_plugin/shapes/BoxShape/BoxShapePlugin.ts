import type { PluginContext } from "@/protocol/plugins/PluginContext";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";
import { BoxTypeLabelDecorator } from "./BoxTypeLabelDecorator";
import { BoxAttributeHandler } from "./BoxAttributeHandler";
import { BoxShapeContribution } from "./BoxShapeContribution";

/**
 * box 图形插件：形状 + 属性处理器 + (box) 树标签。
 * 装配须在普通 g 贡献之前激活，以便 data-kind=box 优先认领。
 */
export class BoxShapePlugin implements SvgPlugin {
  public readonly name = "@svgframe/plugin-shape-box";

  public activate(context: PluginContext): void {
    context.registerShape(BoxShapeContribution.create());
    context.registerAttribute(new BoxAttributeHandler());
    context.registerDecorator(new BoxTypeLabelDecorator());
  }
}

export default BoxShapePlugin;
