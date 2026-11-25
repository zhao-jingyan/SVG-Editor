import { CommandResult } from "@/protocol/results/CommandResult";
import type { CommandResultDto } from "@/protocol/results/dto/CommandResultDto";

export class CommandSuccessResult extends CommandResult {
  private readonly message: string;

  public constructor(message: string) {
    super();
    this.message = message;
  }

  public isSuccess(): boolean {
    return true;
  }

  public toCommandResultDto(): CommandResultDto {
    return { type: "success", message: this.message };
  }
}
