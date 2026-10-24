import type { CommandErrorCode } from "./CommandErrorCode";
import type { CommandErrorDto } from "./dto/CommandErrorDto";
import { ErrorSource } from "./ErrorSource";

export class ProtocolError extends Error {
  private readonly source: ErrorSource;
  private readonly code: CommandErrorCode;

  public constructor(
    source: ErrorSource,
    code: CommandErrorCode,
    message: string,
  ) {
    super(message);
    this.name = source;
    this.source = source;
    this.code = code;
  }

  public static commandParse(
    code: CommandErrorCode,
    message: string,
  ): ProtocolError {
    return new ProtocolError(ErrorSource.CommandParse, code, message);
  }

  public static commandExecution(
    code: CommandErrorCode,
    message: string,
  ): ProtocolError {
    return new ProtocolError(ErrorSource.CommandExecution, code, message);
  }

  public static document(
    code: CommandErrorCode,
    message: string,
  ): ProtocolError {
    return new ProtocolError(ErrorSource.Document, code, message);
  }

  public static shape(
    code: CommandErrorCode,
    message: string,
  ): ProtocolError {
    return new ProtocolError(ErrorSource.Shape, code, message);
  }

  public getCode(): CommandErrorCode {
    return this.code;
  }

  public getSource(): ErrorSource {
    return this.source;
  }

  public toCommandErrorDto(): CommandErrorDto {
    return { code: this.code, message: this.message };
  }
}
