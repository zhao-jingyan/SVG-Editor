import type { CommandResult } from "@/protocol/results/CommandResult";

export interface HistoryCommandReceiver {
  undo(): Promise<CommandResult>;
  redo(): Promise<CommandResult>;
}
