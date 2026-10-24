import type { Command } from "../../../protocol/commands/Command";
import type { CommandErrorDto } from "../../../protocol/errors/dto/CommandErrorDto";

export type CommandParseResultDto =
  | { readonly type: "command"; readonly command: Command }
  | { readonly type: "empty" }
  | { readonly type: "error"; readonly error: CommandErrorDto };

export abstract class CommandParseResult {
  public abstract toCommandParseResultDto(): CommandParseResultDto;
}
