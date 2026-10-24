import type { CommandErrorCode } from "./CommandErrorCode";
import type { CommandErrorDto } from "./dto/CommandErrorDto";

export abstract class ProtocolError extends Error {
  private readonly code: CommandErrorCode;

  protected constructor(code: CommandErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }

  public getCode(): CommandErrorCode {
    return this.code;
  }

  public toCommandErrorDto(): CommandErrorDto {
    return { code: this.code, message: this.message };
  }
}
