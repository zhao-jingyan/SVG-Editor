import type { CommandParseResultDto } from "./CommandParseResultDto";

export abstract class CommandParseResult {
  public abstract toCommandParseResultDto(): CommandParseResultDto;
}
