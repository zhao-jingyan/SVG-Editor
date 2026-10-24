import type { CommandErrorCode } from "../CommandErrorCode";
import { ProtocolError } from "../ProtocolError";

export class CommandParseError extends ProtocolError {
  public constructor(code: CommandErrorCode, message: string) {
    super(code, message);
  }
}
