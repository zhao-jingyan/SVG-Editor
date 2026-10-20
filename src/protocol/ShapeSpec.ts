import type { CircleShapeSpec } from "./shapes/CircleShapeSpec";
import type { ContainerShapeSpec } from "./shapes/ContainerShapeSpec";
import type { EllipseShapeSpec } from "./shapes/EllipseShapeSpec";
import type { LineShapeSpec } from "./shapes/LineShapeSpec";
import type { RectShapeSpec } from "./shapes/RectShapeSpec";
import type { TextShapeSpec } from "./shapes/TextShapeSpec";

export type { CircleShapeSpec } from "./shapes/CircleShapeSpec";
export type { ContainerShapeSpec } from "./shapes/ContainerShapeSpec";
export type { EllipseShapeSpec } from "./shapes/EllipseShapeSpec";
export type { LineShapeSpec } from "./shapes/LineShapeSpec";
export type { RectShapeSpec } from "./shapes/RectShapeSpec";
export type { TextShapeSpec } from "./shapes/TextShapeSpec";

export type ShapeSpec =
  | RectShapeSpec
  | CircleShapeSpec
  | EllipseShapeSpec
  | LineShapeSpec
  | TextShapeSpec
  | ContainerShapeSpec;
