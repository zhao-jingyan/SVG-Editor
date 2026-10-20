import type { CommandResultDto } from "./CommandResultDto";

export abstract class CommandResult {
  public abstract toCommandResultDto(): CommandResultDto;
}
