import type { CircleShape } from "../concrete/CircleShape";
import type { EllipseShape } from "../concrete/EllipseShape";
import type { GroupShape } from "../concrete/GroupShape";
import type { LineShape } from "../concrete/LineShape";
import type { RectShape } from "../concrete/RectShape";
import type { TextShape } from "../concrete/TextShape";

export interface ShapeVisitor<T> {
  visitRect(shape: RectShape): T;
  visitCircle(shape: CircleShape): T;
  visitEllipse(shape: EllipseShape): T;
  visitLine(shape: LineShape): T;
  visitText(shape: TextShape): T;
  visitGroup(shape: GroupShape): T;
}
