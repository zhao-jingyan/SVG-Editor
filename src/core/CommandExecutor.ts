import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { Command } from "@/protocol/commands/Command";
import { UndoableCommand } from "@/protocol/commands/UndoableCommand";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { Executor } from "@/protocol/execution/Executor";
import { CommandErrorResult } from "@/protocol/results/outcomes/CommandErrorResult";
import type { CommandResult } from "@/protocol/results/CommandResult";
import type { CommandHistory } from "./history/CommandHistory";

export class CommandExecutor implements Executor {
  public constructor(
    private readonly receiver: CommandReceiver,
    private readonly history: CommandHistory,
  ) {}

  public async execute(command: Command): Promise<CommandResult> {
    try {
      const result = await command.execute(this.receiver);

      if (result.isSuccess() && command instanceof UndoableCommand) {
        this.history.record(command);
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof ProtocolError) {
        return new CommandErrorResult(error);
      }

      // 扩展实现违约（抛出非 ProtocolError）：转为错误结果，会话继续；
      // 命令未成功，故不入历史栈；已捕获快照的命令自行回滚后再抛出。
      const reason = error instanceof Error ? error.message : String(error);
      return new CommandErrorResult(
        ProtocolError.commandExecution(
          CommandErrorCode.CommandFailed,
          `command failed: ${reason}`,
        ),
      );
    }
  }
}
