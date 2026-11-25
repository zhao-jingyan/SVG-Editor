import type { CommandResult } from "@/protocol/results/CommandResult";

export interface ViewCommandReceiver {
  tree(shapeId?: string): Promise<CommandResult>;
  show(shapeId: string): Promise<CommandResult>;
  help(): Promise<CommandResult>;
}
