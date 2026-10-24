import type { CommandResultDto } from "./dto/CommandResultDto";

export abstract class CommandResult {
  public abstract isSuccess(): boolean;

  public abstract toCommandResultDto(): CommandResultDto;
}
