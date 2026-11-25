import type { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";

export interface CommandErrorDto {
  readonly code: CommandErrorCode;
  readonly message: string;
}
