import { describe, expect, it } from "vitest";
import { Command } from "../../src/protocol/Command";
import { AddToCommand } from "../../src/protocol/commands/AddToCommand";
import { CanvasCommand } from "../../src/protocol/commands/CanvasCommand";
import { CreateCommand } from "../../src/protocol/commands/CreateCommand";
import { DeleteCommand } from "../../src/protocol/commands/DeleteCommand";
import { ExitCommand } from "../../src/protocol/commands/ExitCommand";
import { GroupCommand } from "../../src/protocol/commands/GroupCommand";
import { HelpCommand } from "../../src/protocol/commands/HelpCommand";
import { InitCommand } from "../../src/protocol/commands/InitCommand";
import { MoveCommand } from "../../src/protocol/commands/MoveCommand";
import { ReadCommand } from "../../src/protocol/commands/ReadCommand";
import { RedoCommand } from "../../src/protocol/commands/RedoCommand";
import { ReorderCommand } from "../../src/protocol/commands/ReorderCommand";
import { SaveCommand } from "../../src/protocol/commands/SaveCommand";
import { ScaleCommand } from "../../src/protocol/commands/ScaleCommand";
import { SetCommand } from "../../src/protocol/commands/SetCommand";
import { ShowCommand } from "../../src/protocol/commands/ShowCommand";
import { TreeCommand } from "../../src/protocol/commands/TreeCommand";
import { UndoCommand } from "../../src/protocol/commands/UndoCommand";
import { UngroupCommand } from "../../src/protocol/commands/UngroupCommand";
import { UndoableCommand } from "../../src/protocol/UndoableCommand";
import { RecordingCommandContext } from "../support/RecordingCommandContext";

describe("Command 类层次", () => {
  it("编辑命令继承 UndoableCommand", () => {
    const commands: Command[] = [
      new CreateCommand({ type: "g", id: "g1" }),
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

  it("未实现的具体逆操作返回 command-not-implemented", async () => {
    const context = new RecordingCommandContext();

    await expect(new MoveCommand("r1", 10, 20).undo(context)).resolves.toEqual({
      type: "error",
      error: {
        code: "command-not-implemented",
        message: "undo is not implemented for command: move",
      },
    });
  });
});
