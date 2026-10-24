import { CommandResult } from "../CommandResult";
import type { CommandResultDto } from "../dto/CommandResultDto";

export class CommandExitResult extends CommandResult {
  public isSuccess(): boolean {
    return false;
  }

  public toCommandResultDto(): CommandResultDto {
    return { type: "exit" };
  }
}
