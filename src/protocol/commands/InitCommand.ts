export interface InitCommand {
  readonly type: "init";
  readonly width?: number;
  readonly height?: number;
}
