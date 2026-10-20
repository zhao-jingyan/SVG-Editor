import type { CommandResultDto } from "./CommandResultDto";

export abstract class CommandResult {
  public abstract isSuccess(): boolean;

  public abstract toCommandResultDto(): CommandResultDto;
}
