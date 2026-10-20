export interface MoveCommand {
  readonly type: "move";
  readonly shapeId: string;
  readonly dx: number;
  readonly dy: number;
}
