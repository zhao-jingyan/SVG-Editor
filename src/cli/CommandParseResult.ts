import type { Command } from "../protocol/Command";
import type { CommandError } from "../protocol/CommandError";

export type CommandParseResult =
  | { readonly type: "command"; readonly command: Command }
  | { readonly type: "empty" }
  | { readonly type: "error"; readonly error: CommandError };
