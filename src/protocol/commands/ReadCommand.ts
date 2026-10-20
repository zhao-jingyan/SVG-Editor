export interface ReadCommand {
  readonly type: "read";
  readonly path: string;
}
