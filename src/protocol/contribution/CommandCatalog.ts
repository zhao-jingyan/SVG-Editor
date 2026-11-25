import type { CommandContribution } from "./CommandContribution";

/**
 * 只读命令目录：按名称查找贡献对象，并按注册顺序枚举。
 */
export interface CommandCatalog {
  find(commandName: string): CommandContribution | undefined;
  getContributions(): readonly CommandContribution[];
}
