export interface CanvasCommand {
  readonly type: "canvas";
  readonly width?: number;
  readonly height?: number;
}
