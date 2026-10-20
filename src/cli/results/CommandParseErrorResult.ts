import type { ProtocolError } from "../../protocol/errors/ProtocolError";
import { CommandParseResult } from "./CommandParseResult";
import type { CommandParseResultDto } from "./CommandParseResultDto";

export class CommandParseErrorResult extends CommandParseResult {
  private readonly error: ProtocolError;

  public constructor(error: ProtocolError) {
    super();
    this.error = error;
  }

  public toCommandParseResultDto(): CommandParseResultDto {
    return { type: "error", error: this.error.toCommandErrorDto() };
  }
}
