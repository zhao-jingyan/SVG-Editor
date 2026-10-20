import type { CommandErrorCode } from "./CommandErrorCode";

export interface CommandErrorDto {
  readonly code: CommandErrorCode;
  readonly message: string;
}
