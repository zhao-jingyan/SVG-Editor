import type { CommandErrorDto } from "../errors/dto/CommandErrorDto";

export type CommandResultDto =
  | { readonly type: "success"; readonly message: string }
  | { readonly type: "error"; readonly error: CommandErrorDto }
  | { readonly type: "exit" };
