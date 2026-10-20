import { CommandParseResult } from "./CommandParseResult";
import type { CommandParseResultDto } from "./CommandParseResultDto";

export class CommandParseEmptyResult extends CommandParseResult {
  public toCommandParseResultDto(): CommandParseResultDto {
    return { type: "empty" };
  }
}
