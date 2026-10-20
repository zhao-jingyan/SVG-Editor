import type { CommandParseResult } from "./CommandParseResult";

export interface CommandParser {
  parse(line: string): CommandParseResult;
}
