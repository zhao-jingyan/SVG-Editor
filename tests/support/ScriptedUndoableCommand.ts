import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";
import { UndoableCommand } from "@/protocol/commands/_common/UndoableCommand";

type ScriptedOutcome = CommandResult | Error;

export class ScriptedUndoableCommand extends UndoableCommand {
  private executeCount = 0;
  private undoCount = 0;

  public constructor(
    private readonly executeOutcome: ScriptedOutcome = new CommandSuccessResult(
      "executed",
    ),
    private readonly undoOutcome: ScriptedOutcome = new CommandSuccessResult(
      "undone",
    ),
  ) {
    super();
  }

  public async execute(_receiver: CommandReceiver): Promise<CommandResult> {
    this.executeCount += 1;
    return this.resolve(this.executeOutcome);
  }

  public async undo(_receiver: CommandReceiver): Promise<CommandResult> {
    this.undoCount += 1;
    return this.resolve(this.undoOutcome);
  }

  public getExecuteCount(): number {
    return this.executeCount;
  }

  public getUndoCount(): number {
    return this.undoCount;
  }

  private resolve(outcome: ScriptedOutcome): CommandResult {
    if (outcome instanceof Error) {
      throw outcome;
    }

    return outcome;
  }
}
