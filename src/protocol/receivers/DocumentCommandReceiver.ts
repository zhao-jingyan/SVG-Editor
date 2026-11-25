import type { CommandResult } from "../results/CommandResult";
import type { Shape } from "../shapes/model/Shape";

export interface DocumentCommandReceiver {
  init(width?: number, height?: number): Promise<CommandResult>;
  read(path: string): Promise<CommandResult>;
  save(path?: string): Promise<CommandResult>;
  canvas(width?: number, height?: number): Promise<CommandResult>;

  /**
   * 返回画布根下直接子节点（只读，顺序与文档一致）。
   * 无文档时抛 NoDocument；空画布返回 []。
   */
  getRootShapes(): readonly Shape[];
}
