export interface SaveCommand {
  readonly type: "save";
  readonly path?: string;
}
