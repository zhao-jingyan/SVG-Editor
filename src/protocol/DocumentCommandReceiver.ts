import type { CommandResult } from "./results/CommandResult";

export interface DocumentCommandReceiver {
  init(width?: number, height?: number): Promise<CommandResult>;
  read(path: string): Promise<CommandResult>;
  save(path?: string): Promise<CommandResult>;
  canvas(width?: number, height?: number): Promise<CommandResult>;
}
