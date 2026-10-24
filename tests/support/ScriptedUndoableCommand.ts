import type { CommandContext } from "../../src/protocol/CommandContext";
import type { CommandType } from "../../src/protocol/commands/CommandType";
import type { CommandResult } from "../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../src/protocol/results/CommandSuccessResult";
import { UndoableCommand } from "../../src/protocol/commands/UndoableCommand";

type ScriptedOutcome = CommandResult | Error;

export class ScriptedUndoableCommand extends UndoableCommand {
  public readonly type: CommandType = "move";

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

  public async execute(_context: CommandContext): Promise<CommandResult> {
    this.executeCount += 1;
    return this.resolve(this.executeOutcome);
  }

  public async undo(_context: CommandContext): Promise<CommandResult> {
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
