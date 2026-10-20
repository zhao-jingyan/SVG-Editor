export interface CircleShapeSpec {
  readonly type: "circle";
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly fill?: string;
}
