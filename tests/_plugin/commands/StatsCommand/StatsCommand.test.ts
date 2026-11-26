import { describe, expect, it } from "vitest";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { GroupCommand } from "@/_builtin/commands/GroupCommand/GroupCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { UndoCommand } from "@/_builtin/commands/UndoCommand/UndoCommand";
import { CommandExecutor } from "@/core/CommandExecutor";
import { CommandHistory } from "@/core/history/CommandHistory";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { StatsCommand } from "@/_plugin/commands/StatsCommand/StatsCommand";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { CircleShape } from "@/protocol/shapes/concrete/CircleShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";

describe("StatsCommand", () => {
  it("无文档时失败，有文档时输出统计且不入 undo", async () => {
    const history = new CommandHistory();
    const receiver = new EditorCommandReceiver(history);
    const executor = new CommandExecutor(receiver, history);

    expect((await executor.execute(new StatsCommand())).toCommandResultDto()).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.NoDocument,
        message: "no document. use 'init' or 'read' first",
      },
    });

    await executor.execute(new InitCommand(800, 600));
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 10, 10)));
    await executor.execute(new CreateCommand(new CircleShape("c1", 1, 2, 3)));
    await executor.execute(new CreateCommand(new TextShape("t1", 4, 5, "a")));
    await executor.execute(new CreateCommand(new TextShape("t2", 4, 5, "b")));
    await executor.execute(new GroupCommand("g1", ["c1", "t1"]));

    expect((await executor.execute(new StatsCommand())).toCommandResultDto()).toEqual({
      type: "success",
      message: "rect: 1  text: 2  circle: 1  (total 4, containers 1)",
    });

    expect((await executor.execute(new UndoCommand())).toCommandResultDto()).toEqual({
      type: "success",
      message: "g#g1 removed",
    });
  });
});
