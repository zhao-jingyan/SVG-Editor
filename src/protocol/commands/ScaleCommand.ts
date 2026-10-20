export interface ScaleCommand {
  readonly type: "scale";
  readonly shapeId: string;
  readonly factor: number;
}
