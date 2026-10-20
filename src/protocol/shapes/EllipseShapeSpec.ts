export interface EllipseShapeSpec {
  readonly type: "ellipse";
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly fill?: string;
}
