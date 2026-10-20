import type { CommandError } from "./CommandError";

export type CommandResult =
  | { readonly type: "success"; readonly message: string }
  | { readonly type: "error"; readonly error: CommandError }
  | { readonly type: "exit" };
