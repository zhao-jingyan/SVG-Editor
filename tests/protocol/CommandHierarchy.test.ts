import { describe, expect, it } from "vitest";
import { Command } from "../../src/protocol/commands/_common/Command";
import { AddToCommand } from "../../src/protocol/commands/builtin/AddToCommand/AddToCommand";
import { CanvasCommand } from "../../src/protocol/commands/builtin/CanvasCommand/CanvasCommand";
import { CreateCommand } from "../../src/protocol/commands/builtin/CreateCommand/CreateCommand";
import { DeleteCommand } from "../../src/protocol/commands/builtin/DeleteCommand/DeleteCommand";
import { ExitCommand } from "../../src/protocol/commands/builtin/ExitCommand/ExitCommand";
import { GroupCommand } from "../../src/protocol/commands/builtin/GroupCommand/GroupCommand";
import { HelpCommand } from "../../src/protocol/commands/builtin/HelpCommand/HelpCommand";
import { InitCommand } from "../../src/protocol/commands/builtin/InitCommand/InitCommand";
import { MoveCommand } from "../../src/protocol/commands/builtin/MoveCommand/MoveCommand";
import { ReadCommand } from "../../src/protocol/commands/builtin/ReadCommand/ReadCommand";
import { RedoCommand } from "../../src/protocol/commands/builtin/RedoCommand/RedoCommand";
import { ReorderCommand } from "../../src/protocol/commands/builtin/ReorderCommand/ReorderCommand";
import { SaveCommand } from "../../src/protocol/commands/builtin/SaveCommand/SaveCommand";
import { ScaleCommand } from "../../src/protocol/commands/builtin/ScaleCommand/ScaleCommand";
import { SetCommand } from "../../src/protocol/commands/builtin/SetCommand/SetCommand";
import { ShowCommand } from "../../src/protocol/commands/builtin/ShowCommand/ShowCommand";
import { TreeCommand } from "../../src/protocol/commands/builtin/TreeCommand/TreeCommand";
import { UndoCommand } from "../../src/protocol/commands/builtin/UndoCommand/UndoCommand";
import { UngroupCommand } from "../../src/protocol/commands/builtin/UngroupCommand/UngroupCommand";
import { UndoableCommand } from "../../src/protocol/commands/_common/UndoableCommand";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import type { CommandReceiver } from "../../src/protocol/receivers/CommandReceiver";
import type { CommandResult } from "../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../src/protocol/results/outcomes/CommandSuccessResult";
import { GroupShape } from "../../src/protocol/shapes/concrete/GroupShape";
import { RecordingCommandReceiver } from "../support/RecordingCommandReceiver";

describe("Command 类层次", () => {
  it("编辑命令继承 UndoableCommand", () => {
    const commands: Command[] = [
      new CreateCommand(new GroupShape("g1")),
      new DeleteCommand("r1"),
      new MoveCommand("r1", 1, 2),
      new ScaleCommand("r1", 2),
      new SetCommand("r1", "fill", "red"),
      new GroupCommand("g1", ["r1", "c1"]),
      new UngroupCommand("g1"),
      new AddToCommand("g1", "r1"),
      new ReorderCommand("r1", "front"),
    ];

    for (const command of commands) {
      expect(command).toBeInstanceOf(UndoableCommand);
      expect(command).toBeInstanceOf(Command);
    }
  });

  it("文档、显示和历史命令不属于可撤销命令", () => {
    const commands: Command[] = [
      new InitCommand(),
      new ReadCommand("demo.svg"),
      new SaveCommand(),
      new CanvasCommand(),
      new TreeCommand(),
      new ShowCommand("r1"),
      new HelpCommand(),
      new UndoCommand(),
      new RedoCommand(),
      new ExitCommand(),
    ];

    for (const command of commands) {
      expect(command).toBeInstanceOf(Command);
      expect(command).not.toBeInstanceOf(UndoableCommand);
    }
  });

  it("具体撤销命令调用对应的逆操作", async () => {
    const receiver = new RecordingCommandReceiver();
    const command = new MoveCommand("r1", 10, 20);
    await command.execute(receiver);
    const result = await command.undo(receiver);

    expect(result.isSuccess()).toBe(true);
    expect(receiver.calls).toEqual([
      { method: "moveShape", args: ["r1", 10, 20] },
      { method: "moveShape", args: ["r1", -10, -20] },
    ]);
  });

  it("UndoableCommand 未执行与未实现 undo 使用类名诊断", async () => {
    class IncompleteUndoableCommand extends UndoableCommand {
      public async execute(
        _receiver: CommandReceiver,
      ): Promise<CommandResult> {
        return new CommandSuccessResult("ok");
      }
    }

    const receiver = new RecordingCommandReceiver();

    expect(
      (await new IncompleteUndoableCommand().undo(receiver)).toCommandResultDto(),
    ).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.CommandNotImplemented,
        message:
          "undo is not implemented for command: IncompleteUndoableCommand",
      },
    });

    expect(
      (await new MoveCommand("r1", 1, 2).undo(receiver)).toCommandResultDto(),
    ).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.InvalidArgument,
        message: "command has not been executed: MoveCommand",
      },
    });
  });
});
