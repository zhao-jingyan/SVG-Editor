import type { ProtocolError } from "@/protocol/errors/ProtocolError";
import { CommandResult } from "@/protocol/results/CommandResult";
import type { CommandResultDto } from "@/protocol/results/dto/CommandResultDto";

export class CommandErrorResult extends CommandResult {
  private readonly error: ProtocolError;

  public constructor(error: ProtocolError) {
    super();
    this.error = error;
  }

  public isSuccess(): boolean {
    return false;
  }

  public toCommandResultDto(): CommandResultDto {
    return { type: "error", error: this.error.toCommandErrorDto() };
  }
}
