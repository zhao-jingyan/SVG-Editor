import type { Command } from "../../protocol/Command";
import { CommandParseResult } from "./CommandParseResult";
import type { CommandParseResultDto } from "./CommandParseResultDto";

export class CommandParseSuccessResult extends CommandParseResult {
  private readonly command: Command;

  public constructor(command: Command) {
    super();
    this.command = command;
  }

  public toCommandParseResultDto(): CommandParseResultDto {
    return { type: "command", command: this.command };
  }
}
