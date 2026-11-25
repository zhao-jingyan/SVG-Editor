import type { CircleShape } from "@/protocol/shapes/concrete/CircleShape";
import type { EllipseShape } from "@/protocol/shapes/concrete/EllipseShape";
import type { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import type { LineShape } from "@/protocol/shapes/concrete/LineShape";
import type { RectShape } from "@/protocol/shapes/concrete/RectShape";
import type { TextShape } from "@/protocol/shapes/concrete/TextShape";

export interface ShapeVisitor<T> {
  visitRect(shape: RectShape): T;
  visitCircle(shape: CircleShape): T;
  visitEllipse(shape: EllipseShape): T;
  visitLine(shape: LineShape): T;
  visitText(shape: TextShape): T;
  visitGroup(shape: GroupShape): T;
}
