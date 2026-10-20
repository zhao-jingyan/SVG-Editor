export interface UngroupCommand {
  readonly type: "ungroup";
  readonly containerId: string;
}
