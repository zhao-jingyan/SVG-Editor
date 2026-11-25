import { CircleShapeContribution } from "@/_builtin/shapes/CircleShape/CircleShapeContribution";
import { EllipseShapeContribution } from "@/_builtin/shapes/EllipseShape/EllipseShapeContribution";
import { GroupShapeContribution } from "@/_builtin/shapes/GroupShape/GroupShapeContribution";
import { LineShapeContribution } from "@/_builtin/shapes/LineShape/LineShapeContribution";
import { RectShapeContribution } from "@/_builtin/shapes/RectShape/RectShapeContribution";
import { TextShapeContribution } from "@/_builtin/shapes/TextShape/TextShapeContribution";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";

/** 测试夹具：注册六种内置图形贡献（镜像 main）。 */
export function createBuiltinShapeCatalog(): ShapeRegistry {
  const registry = new ShapeRegistry();
  registry.registerAll([
    RectShapeContribution.create(),
    CircleShapeContribution.create(),
    EllipseShapeContribution.create(),
    LineShapeContribution.create(),
    TextShapeContribution.create(),
    GroupShapeContribution.create(),
  ]);
  return registry;
}
