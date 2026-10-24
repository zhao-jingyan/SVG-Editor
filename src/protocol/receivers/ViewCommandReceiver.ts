import type { CommandResult } from "../results/CommandResult";

export interface ViewCommandReceiver {
  tree(shapeId?: string): Promise<CommandResult>;
  show(shapeId: string): Promise<CommandResult>;
  help(): Promise<CommandResult>;
}
