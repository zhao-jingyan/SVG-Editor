export interface ReorderCommand {
  readonly type: "reorder";
  readonly shapeId: string;
  readonly position: "front" | "back";
}
