import type { Command } from "../../../protocol/Command";
import {
  CommandParseResult,
  type CommandParseResultDto,
} from "./CommandParseResult";

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
