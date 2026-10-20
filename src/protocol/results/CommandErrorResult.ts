import type { ProtocolError } from "../errors/ProtocolError";
import { CommandResult } from "./CommandResult";
import type { CommandResultDto } from "./CommandResultDto";

export class CommandErrorResult extends CommandResult {
  private readonly error: ProtocolError;

  public constructor(error: ProtocolError) {
    super();
    this.error = error;
  }

  public toCommandResultDto(): CommandResultDto {
    return { type: "error", error: this.error.toCommandErrorDto() };
  }
}
