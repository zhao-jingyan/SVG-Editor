import type { CommandResult } from "./results/CommandResult";

export interface HistoryCommandReceiver {
  undo(): Promise<CommandResult>;
  redo(): Promise<CommandResult>;
}
