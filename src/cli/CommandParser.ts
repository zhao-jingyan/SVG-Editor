import type { CommandParseResult } from "./results/CommandParseResult";

export interface CommandParser {
  parse(line: string): CommandParseResult;
}
