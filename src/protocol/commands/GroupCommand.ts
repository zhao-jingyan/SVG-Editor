export interface GroupCommand {
  readonly type: "group";
  readonly containerId: string;
  readonly memberIds: readonly string[];
}
