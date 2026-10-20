import type { CommandErrorDto } from "../errors/CommandErrorDto";

export type CommandResultDto =
  | { readonly type: "success"; readonly message: string }
  | { readonly type: "error"; readonly error: CommandErrorDto }
  | { readonly type: "exit" };
