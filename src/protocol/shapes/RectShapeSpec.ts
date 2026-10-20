export interface RectShapeSpec {
  readonly type: "rect";
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill?: string;
}
