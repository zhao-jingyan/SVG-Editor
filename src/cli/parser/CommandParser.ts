import type { CommandParseResult } from "./results/CommandParseResult";

/**
 * 把一行 CLI 输入解释为命令、空输入或语法错误。
 */
export interface CommandParser {
  parse(line: string): CommandParseResult;
}
