import type { CommandErrorCode } from "./CommandErrorCode";

export interface CommandError {
  readonly code: CommandErrorCode;
  readonly message: string;
}
