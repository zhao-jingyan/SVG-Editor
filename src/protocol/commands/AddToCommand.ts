export interface AddToCommand {
  readonly type: "addto";
  readonly containerId: string;
  readonly shapeId: string;
}
