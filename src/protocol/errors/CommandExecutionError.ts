import type { CommandErrorCode } from "./CommandErrorCode";
import { ProtocolError } from "./ProtocolError";

export class CommandExecutionError extends ProtocolError {
  public constructor(code: CommandErrorCode, message: string) {
    super(code, message);
  }
}
