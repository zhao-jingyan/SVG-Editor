import { describe, expect, it } from "vitest";
import { Command } from "../../src/protocol/Command";
import { AddToCommand } from "../../src/protocol/commands/shape/AddToCommand";
import { CanvasCommand } from "../../src/protocol/commands/doc/CanvasCommand";
import { CreateCommand } from "../../src/protocol/commands/shape/CreateCommand";
import { DeleteCommand } from "../../src/protocol/commands/shape/DeleteCommand";
import { ExitCommand } from "../../src/protocol/commands/session/ExitCommand";
import { GroupCommand } from "../../src/protocol/commands/shape/GroupCommand";
import { HelpCommand } from "../../src/protocol/commands/view/HelpCommand";
import { InitCommand } from "../../src/protocol/commands/doc/InitCommand";
import { MoveCommand } from "../../src/protocol/commands/shape/MoveCommand";
import { ReadCommand } from "../../src/protocol/commands/doc/ReadCommand";
import { RedoCommand } from "../../src/protocol/commands/history/RedoCommand";
import { ReorderCommand } from "../../src/protocol/commands/shape/ReorderCommand";
import { SaveCommand } from "../../src/protocol/commands/doc/SaveCommand";
import { ScaleCommand } from "../../src/protocol/commands/shape/ScaleCommand";
import { SetCommand } from "../../src/protocol/commands/shape/SetCommand";
import { ShowCommand } from "../../src/protocol/commands/view/ShowCommand";
import { TreeCommand } from "../../src/protocol/commands/view/TreeCommand";
import { UndoCommand } from "../../src/protocol/commands/history/UndoCommand";
import { UngroupCommand } from "../../src/protocol/commands/shape/UngroupCommand";
import { UndoableCommand } from "../../src/protocol/UndoableCommand";
import { GroupShape } from "../../src/protocol/shapes/GroupShape";
import { RecordingCommandContext } from "../support/RecordingCommandContext";

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
    const context = new RecordingCommandContext();
    const command = new MoveCommand("r1", 10, 20);
    await command.execute(context);
    const result = await command.undo(context);

    expect(result.isSuccess()).toBe(true);
    expect(context.calls).toEqual([
      { method: "moveShape", args: ["r1", 10, 20] },
      { method: "moveShape", args: ["r1", -10, -20] },
    ]);
  });
});
