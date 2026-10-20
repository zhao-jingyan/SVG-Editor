import type { CircleShape } from "./CircleShape";
import type { EllipseShape } from "./EllipseShape";
import type { GroupShape } from "./GroupShape";
import type { LineShape } from "./LineShape";
import type { RectShape } from "./RectShape";
import type { TextShape } from "./TextShape";

export interface ShapeVisitor<T> {
  visitRect(shape: RectShape): T;
  visitCircle(shape: CircleShape): T;
  visitEllipse(shape: EllipseShape): T;
  visitLine(shape: LineShape): T;
  visitText(shape: TextShape): T;
  visitGroup(shape: GroupShape): T;
}
