import { CircleShapeContribution } from "@/_builtin/shapes/CircleShape/CircleShapeContribution";
import { EllipseShapeContribution } from "@/_builtin/shapes/EllipseShape/EllipseShapeContribution";
import { GroupShapeContribution } from "@/_builtin/shapes/GroupShape/GroupShapeContribution";
import { LineShapeContribution } from "@/_builtin/shapes/LineShape/LineShapeContribution";
import { RectShapeContribution } from "@/_builtin/shapes/RectShape/RectShapeContribution";
import { TextShapeContribution } from "@/_builtin/shapes/TextShape/TextShapeContribution";
import { BoxShapeContribution } from "@/_plugin/shapes/BoxShape/BoxShapeContribution";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";

/** 测试夹具：内置六种 + box（镜像 main 的图形注册顺序）。 */
export function createPluginShapeCatalog(): ShapeRegistry {
  const registry = new ShapeRegistry();
  registry.registerAll([
    RectShapeContribution.create(),
    CircleShapeContribution.create(),
    EllipseShapeContribution.create(),
    LineShapeContribution.create(),
    TextShapeContribution.create(),
    BoxShapeContribution.create(),
    GroupShapeContribution.create(),
  ]);
  return registry;
}
