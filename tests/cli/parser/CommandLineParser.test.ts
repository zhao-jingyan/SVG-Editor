import { describe, expect, it } from "vitest";
import { CommandLineParser } from "../../../src/cli/parser/CommandLineParser";
import type { CommandParseResultDto } from "../../../src/cli/parser/results/CommandParseResult";
import { CommandParseEmptyResult } from "../../../src/cli/parser/results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "../../../src/cli/parser/results/CommandParseErrorResult";
import type { Command } from "../../../src/protocol/commands/Command";
import type { EditableAttribute } from "../../../src/protocol/EditableAttribute";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { AddToCommand } from "../../../src/protocol/commands/shape/AddToCommand";
import { CanvasCommand } from "../../../src/protocol/commands/doc/CanvasCommand";
import { CreateCommand } from "../../../src/protocol/commands/shape/CreateCommand";
import { DeleteCommand } from "../../../src/protocol/commands/shape/DeleteCommand";
import { ExitCommand } from "../../../src/protocol/commands/session/ExitCommand";
import { GroupCommand } from "../../../src/protocol/commands/shape/GroupCommand";
import { HelpCommand } from "../../../src/protocol/commands/view/HelpCommand";
import { InitCommand } from "../../../src/protocol/commands/doc/InitCommand";
import { MoveCommand } from "../../../src/protocol/commands/shape/MoveCommand";
import { ReadCommand } from "../../../src/protocol/commands/doc/ReadCommand";
import { RedoCommand } from "../../../src/protocol/commands/history/RedoCommand";
import { ReorderCommand } from "../../../src/protocol/commands/shape/ReorderCommand";
import { SaveCommand } from "../../../src/protocol/commands/doc/SaveCommand";
import { ScaleCommand } from "../../../src/protocol/commands/shape/ScaleCommand";
import { SetCommand } from "../../../src/protocol/commands/shape/SetCommand";
import { ShowCommand } from "../../../src/protocol/commands/view/ShowCommand";
import { TreeCommand } from "../../../src/protocol/commands/view/TreeCommand";
import { UndoCommand } from "../../../src/protocol/commands/history/UndoCommand";
import { UngroupCommand } from "../../../src/protocol/commands/shape/UngroupCommand";
import { CircleShape } from "../../../src/protocol/shapes/CircleShape";
import { EllipseShape } from "../../../src/protocol/shapes/EllipseShape";
import { GroupShape } from "../../../src/protocol/shapes/GroupShape";
import { LineShape } from "../../../src/protocol/shapes/LineShape";
import { RectShape } from "../../../src/protocol/shapes/RectShape";
import { Shape } from "../../../src/protocol/shapes/Shape";
import { ShapeFactory } from "../../../src/protocol/shapes/ShapeFactory";
import { TextShape } from "../../../src/protocol/shapes/TextShape";
import { CommandExitResult } from "../../../src/protocol/results/outcomes/CommandExitResult";
import type { CommandResult } from "../../../src/protocol/results/CommandResult";
import {
  RecordingCommandContext,
  type ContextCall,
} from "../../support/RecordingCommandContext";

type CommandConstructor = new (...args: any[]) => Command;
type ShapeConstructor = new (...args: any[]) => Shape;

const parser = new CommandLineParser(new ShapeFactory());

function parseCommand(input: string): Command {
  const result = parseDto(input);

  if (result.type !== "command") {
    throw new Error(`expected command, received ${result.type}`);
  }

  return result.command;
}

function parseDto(input: string): CommandParseResultDto {
  return parser.parse(input).toCommandParseResultDto();
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

async function expectCreateCommand(
  input: string,
  constructor: ShapeConstructor,
  id: string,
  attributes: readonly (readonly [EditableAttribute, string | number])[],
  parentId?: string,
): Promise<void> {
  const { command, calls } = await execute(input);

  expect(command).toBeInstanceOf(CreateCommand);
  expect(calls).toHaveLength(1);
  expect(calls[0].method).toBe("createShape");
  expect(calls[0].args[1]).toBe(parentId);

  const shape = calls[0].args[0];
  expect(shape).toBeInstanceOf(constructor);
  expect(shape).toBeInstanceOf(Shape);

  if (!(shape instanceof Shape)) {
    throw new Error("expected shape instance");
  }

  expect(shape.getId()).toBe(id);

  for (const [attribute, value] of attributes) {
    expect(shape.getAttribute(attribute)).toBe(value);
  }
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
    await expectCreateCommand(
      "create rect r1 10 20 100 50 #fff in g1",
      RectShape,
      "r1",
      [
        ["x", 10],
        ["y", 20],
        ["width", 100],
        ["height", 50],
        ["fill", "#fff"],
      ],
      "g1",
    );
    await expectCreateCommand("create circle c1 100 100 20", CircleShape, "c1", [
      ["cx", 100],
      ["cy", 100],
      ["r", 20],
    ]);
    await expectCreateCommand(
      "create ellipse e1 1 2 3 4 red in g1",
      EllipseShape,
      "e1",
      [
        ["cx", 1],
        ["cy", 2],
        ["rx", 3],
        ["ry", 4],
        ["fill", "red"],
      ],
      "g1",
    );
    await expectCreateCommand("create line l1 0 0 10 10 black", LineShape, "l1", [
      ["x1", 0],
      ["y1", 0],
      ["x2", 10],
      ["y2", 10],
      ["stroke", "black"],
    ]);
    await expectCreateCommand(
      'create text t1 20 40 "My Diagram" in g1',
      TextShape,
      "t1",
      [
        ["x", 20],
        ["y", 40],
        ["text", "My Diagram"],
      ],
      "g1",
    );
    await expectCreateCommand("create g g1", GroupShape, "g1", []);

    const emptyText = await execute('create text empty 0 0 ""');
    const emptyTextShape = emptyText.calls[0].args[0];
    expect(emptyTextShape).toBeInstanceOf(TextShape);
    expect((emptyTextShape as TextShape).getAttribute("text")).toBe("");
  });

  it("报告图形工厂的参数错误", () => {
    expect(parseDto("create hexagon h1 0 0")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.UnknownShapeType },
    });
    expect(parseDto("create rect r1 nope 0 10 10")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidNumber },
    });
    expect(parseDto("create circle c1 0 0")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
    expect(parseDto("create g g1 extra")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
    expect(parseDto("create rect r1 0 0 10 10 in")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
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
    expect(result).toBeInstanceOf(CommandExitResult);
    expect(result.toCommandResultDto()).toEqual({ type: "exit" });
  });

  it("将空行和注释行视为空输入", () => {
    expect(parser.parse("")).toBeInstanceOf(CommandParseEmptyResult);
    expect(parseDto("")).toEqual({ type: "empty" });
    expect(parseDto("   ")).toEqual({ type: "empty" });
    expect(parseDto("  # create rect r1 0 0 10 10")).toEqual({ type: "empty" });
  });

  it("报告未知命令和元数错误", () => {
    expect(parseDto("unknown")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidCommand },
    });
    expect(parseDto("init 800")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
    expect(parseDto("group g1 r1")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
  });

  it("报告数字和图形类型错误", () => {
    expect(parseDto("move r1 abc 10")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidNumber },
    });
    expect(parseDto("create hexagon h1 0 0")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.UnknownShapeType },
    });
    expect(parseDto("create rect r1 0 0 10")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
  });

  it("报告属性、引号和尾缀错误", () => {
    expect(parseDto("set r1 opacity 0.5")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.UnknownAttribute },
    });
    expect(parseDto('create text t1 0 0 "unterminated')).toMatchObject({
      type: "error",
      error: {
        code: CommandErrorCode.InvalidArgument,
        message: "unterminated quoted string",
      },
    });
    expect(parseDto("create rect r1 0 0 10 10 red blue")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
    expect(parseDto("create g g1 in")).toMatchObject({
      type: "error",
      error: { code: CommandErrorCode.InvalidArgument },
    });
  });

  it("解析错误结果是可序列化 DTO，而不是异常实例", () => {
    const parseResult = parser.parse("unknown");
    const result = parseResult.toCommandParseResultDto();

    expect(parseResult).toBeInstanceOf(CommandParseErrorResult);

    expect(result).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.InvalidCommand,
        message: "unknown command: unknown",
      },
    });

    if (result.type === "error") {
      expect(result.error).not.toBeInstanceOf(Error);
      expect(JSON.parse(JSON.stringify(result.error))).toEqual(result.error);
    }
  });
});
