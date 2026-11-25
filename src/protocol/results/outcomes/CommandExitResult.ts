import { CommandResult } from "@/protocol/results/CommandResult";
import type { CommandResultDto } from "@/protocol/results/dto/CommandResultDto";

export class CommandExitResult extends CommandResult {
  public isSuccess(): boolean {
    return false;
  }

  public toCommandResultDto(): CommandResultDto {
    return { type: "exit" };
  }
}
