import { CommandResult } from "../CommandResult";
import type { CommandResultDto } from "../dto/CommandResultDto";

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
