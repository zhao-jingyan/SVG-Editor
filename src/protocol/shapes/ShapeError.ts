import type { CommandErrorCode } from "../CommandErrorCode";

export class ShapeError extends Error {
  private readonly code: CommandErrorCode;

  public constructor(code: CommandErrorCode, message: string) {
    super(message);
    this.name = "ShapeError";
    this.code = code;
  }

  public getCode(): CommandErrorCode {
    return this.code;
  }
}
