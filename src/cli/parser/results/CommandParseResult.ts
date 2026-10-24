import type { Command } from "../../../protocol/Command";
import type { CommandErrorDto } from "../../../protocol/errors/CommandErrorDto";

export type CommandParseResultDto =
  | { readonly type: "command"; readonly command: Command }
  | { readonly type: "empty" }
  | { readonly type: "error"; readonly error: CommandErrorDto };

export abstract class CommandParseResult {
  public abstract toCommandParseResultDto(): CommandParseResultDto;
}
