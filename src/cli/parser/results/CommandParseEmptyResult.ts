import {
  CommandParseResult,
  type CommandParseResultDto,
} from "./CommandParseResult";

export class CommandParseEmptyResult extends CommandParseResult {
  public toCommandParseResultDto(): CommandParseResultDto {
    return { type: "empty" };
  }
}
