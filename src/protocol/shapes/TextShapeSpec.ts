export interface TextShapeSpec {
  readonly type: "text";
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly content: string;
  readonly fill?: string;
}
