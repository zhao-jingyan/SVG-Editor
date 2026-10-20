import type { Command } from "../protocol/Command";
import type { CommandErrorDto } from "../protocol/errors/CommandErrorDto";

export type CommandParseResult =
  | { readonly type: "command"; readonly command: Command }
  | { readonly type: "empty" }
  | { readonly type: "error"; readonly error: CommandErrorDto };
