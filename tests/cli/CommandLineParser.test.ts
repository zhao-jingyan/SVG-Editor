import { describe, expect, it } from "vitest";
import { CommandLineParser } from "../../src/cli/CommandLineParser";
import type { Command } from "../../src/protocol/Command";
import type { CommandResult } from "../../src/protocol/CommandResult";
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
import {
  RecordingCommandContext,
  type ContextCall,
} from "../support/RecordingCommandContext";

type CommandConstructor = new (...args: any[]) => Command;

const parser = new CommandLineParser();

function parseCommand(input: string): Command {
  const result = parser.parse(input);

  if (result.type !== "command") {
    throw new Error(`expected command, received ${result.type}`);
  }

  return result.command;
}

async function execute(
  input: string,
): Promise<{ command: Command; calls: ContextCall[]; result: CommandResult }> {
  const command = parseCommand(input);
  const context = new RecordingCommandContext();
  const result = await command.execute(context);
  return { command, calls: context.calls, result };
}

async function expectCommand(
  input: string,
  constructor: CommandConstructor,
  method: string,
  args: readonly unknown[],
): Promise<void> {
  const { command, calls } = await execute(input);

  expect(command).toBeInstanceOf(constructor);
  expect(calls).toEqual([{ method, args }]);
}

describe("CommandLineParser", () => {
  it("解析文档命令并调用对应 Context 方法", async () => {
    await expectCommand("init", InitCommand, "init", [undefined, undefined]);
    await expectCommand("init 800 600", InitCommand, "init", [800, 600]);
    await expectCommand(
      'read "diagrams/my flow.svg"',
      ReadCommand,
      "read",
      ["diagrams/my flow.svg"],
    );
    await expectCommand("save", SaveCommand, "save", [undefined]);
    await expectCommand('save "output/demo.svg"', SaveCommand, "save", [
      "output/demo.svg",
    ]);
    await expectCommand("canvas", CanvasCommand, "canvas", [undefined, undefined]);
    await expectCommand("canvas 400 200", CanvasCommand, "canvas", [400, 200]);
  });

  it("解析全部内置图形并创建具体 CreateCommand", async () => {
    await expectCommand("create rect r1 10 20 100 50 #fff in g1", CreateCommand, "createShape", [
      { type: "rect", id: "r1", x: 10, y: 20, width: 100, height: 50, fill: "#fff" },
      "g1",
    ]);
    await expectCommand("create circle c1 100 100 20", CreateCommand, "createShape", [
      { type: "circle", id: "c1", cx: 100, cy: 100, r: 20 },
      undefined,
    ]);
    await expectCommand("create ellipse e1 1 2 3 4 red in g1", CreateCommand, "createShape", [
      { type: "ellipse", id: "e1", cx: 1, cy: 2, rx: 3, ry: 4, fill: "red" },
      "g1",
    ]);
    await expectCommand("create line l1 0 0 10 10 black", CreateCommand, "createShape", [
      { type: "line", id: "l1", x1: 0, y1: 0, x2: 10, y2: 10, stroke: "black" },
      undefined,
    ]);
    await expectCommand(
      'create text t1 20 40 "My Diagram" in g1',
      CreateCommand,
      "createShape",
      [{ type: "text", id: "t1", x: 20, y: 40, content: "My Diagram" }, "g1"],
    );
    await expectCommand("create g g1", CreateCommand, "createShape", [
      { type: "g", id: "g1" },
      undefined,
    ]);
  });

  it("解析图形编辑命令并调用对应 Context 方法", async () => {
    await expectCommand("delete r1", DeleteCommand, "deleteShape", ["r1"]);
    await expectCommand("move r1 -10 20.5", MoveCommand, "moveShape", ["r1", -10, 20.5]);
    await expectCommand("scale r1 2", ScaleCommand, "scaleShape", ["r1", 2]);
    await expectCommand("set r1 fill #f5a623", SetCommand, "setAttribute", [
      "r1",
      "fill",
      "#f5a623",
    ]);
    await expectCommand("set r1 width 120", SetCommand, "setAttribute", [
      "r1",
      "width",
      120,
    ]);
    await expectCommand('set t1 text "更新后的标题"', SetCommand, "setAttribute", [
      "t1",
      "text",
      "更新后的标题",
    ]);
    await expectCommand("group g1 r1 c1", GroupCommand, "groupShapes", [
      "g1",
      ["r1", "c1"],
    ]);
    await expectCommand("ungroup g1", UngroupCommand, "ungroupShapes", ["g1"]);
    await expectCommand("addto g1 r1", AddToCommand, "addToContainer", ["g1", "r1"]);
    await expectCommand("front r1", ReorderCommand, "reorderShape", ["r1", "front"]);
    await expectCommand("back r1", ReorderCommand, "reorderShape", ["r1", "back"]);
  });

  it("解析显示、历史和会话命令", async () => {
    await expectCommand("tree", TreeCommand, "tree", [undefined]);
    await expectCommand("tree g1", TreeCommand, "tree", ["g1"]);
    await expectCommand("show c1", ShowCommand, "show", ["c1"]);
    await expectCommand("help", HelpCommand, "help", []);
    await expectCommand("undo", UndoCommand, "undo", []);
    await expectCommand("redo", RedoCommand, "redo", []);

    const { command, calls, result } = await execute("exit");
    expect(command).toBeInstanceOf(ExitCommand);
    expect(calls).toEqual([]);
    expect(result).toEqual({ type: "exit" });
  });

  it("将空行和注释行视为空输入", () => {
    expect(parser.parse("")).toEqual({ type: "empty" });
    expect(parser.parse("   ")).toEqual({ type: "empty" });
    expect(parser.parse("  # create rect r1 0 0 10 10")).toEqual({ type: "empty" });
  });

  it("报告未知命令和元数错误", () => {
    expect(parser.parse("unknown")).toMatchObject({
      type: "error",
      error: { code: "invalid-command" },
    });
    expect(parser.parse("init 800")).toMatchObject({
      type: "error",
      error: { code: "invalid-argument" },
    });
    expect(parser.parse("group g1 r1")).toMatchObject({
      type: "error",
      error: { code: "invalid-argument" },
    });
  });

  it("报告数字和图形类型错误", () => {
    expect(parser.parse("move r1 abc 10")).toMatchObject({
      type: "error",
      error: { code: "invalid-number" },
    });
    expect(parser.parse("create hexagon h1 0 0")).toMatchObject({
      type: "error",
      error: { code: "unknown-shape-type" },
    });
    expect(parser.parse("create rect r1 0 0 10")).toMatchObject({
      type: "error",
      error: { code: "invalid-argument" },
    });
  });

  it("报告属性、引号和尾缀错误", () => {
    expect(parser.parse("set r1 opacity 0.5")).toMatchObject({
      type: "error",
      error: { code: "unknown-attribute" },
    });
    expect(parser.parse('create text t1 0 0 "unterminated')).toMatchObject({
      type: "error",
      error: { code: "invalid-argument", message: "unterminated quoted string" },
    });
    expect(parser.parse("create rect r1 0 0 10 10 red blue")).toMatchObject({
      type: "error",
      error: { code: "invalid-argument" },
    });
    expect(parser.parse("create g g1 in")).toMatchObject({
      type: "error",
      error: { code: "invalid-argument" },
    });
  });
});
