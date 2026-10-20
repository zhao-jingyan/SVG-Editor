import { describe, expect, it } from "vitest";
import { CommandLineParser } from "../../src/cli/CommandLineParser";
import type { Command } from "../../src/protocol/Command";

const parser = new CommandLineParser();

function parseCommand(input: string): Command {
  const result = parser.parse(input);

  if (result.type !== "command") {
    throw new Error(`expected command, received ${result.type}`);
  }

  return result.command;
}

describe("CommandLineParser", () => {
  it("解析文档命令", () => {
    expect(parseCommand("init")).toEqual({ type: "init" });
    expect(parseCommand("init 800 600")).toEqual({
      type: "init",
      width: 800,
      height: 600,
    });
    expect(parseCommand('read "diagrams/my flow.svg"')).toEqual({
      type: "read",
      path: "diagrams/my flow.svg",
    });
    expect(parseCommand("save")).toEqual({ type: "save" });
    expect(parseCommand('save "output/demo.svg"')).toEqual({
      type: "save",
      path: "output/demo.svg",
    });
    expect(parseCommand("canvas")).toEqual({ type: "canvas" });
    expect(parseCommand("canvas 400 200")).toEqual({
      type: "canvas",
      width: 400,
      height: 200,
    });
  });

  it("解析全部内置图形", () => {
    expect(parseCommand("create rect r1 10 20 100 50 #fff in g1")).toEqual({
      type: "create",
      shape: {
        type: "rect",
        id: "r1",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: "#fff",
      },
      parentId: "g1",
    });
    expect(parseCommand("create circle c1 100 100 20")).toEqual({
      type: "create",
      shape: { type: "circle", id: "c1", cx: 100, cy: 100, r: 20 },
    });
    expect(parseCommand("create ellipse e1 1 2 3 4 red in g1")).toEqual({
      type: "create",
      shape: {
        type: "ellipse",
        id: "e1",
        cx: 1,
        cy: 2,
        rx: 3,
        ry: 4,
        fill: "red",
      },
      parentId: "g1",
    });
    expect(parseCommand("create line l1 0 0 10 10 black")).toEqual({
      type: "create",
      shape: {
        type: "line",
        id: "l1",
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 10,
        stroke: "black",
      },
    });
    expect(parseCommand('create text t1 20 40 "My Diagram" in g1')).toEqual({
      type: "create",
      shape: {
        type: "text",
        id: "t1",
        x: 20,
        y: 40,
        content: "My Diagram",
      },
      parentId: "g1",
    });
    expect(parseCommand("create g g1")).toEqual({
      type: "create",
      shape: { type: "g", id: "g1" },
    });
  });

  it("解析图形编辑命令", () => {
    expect(parseCommand("delete r1")).toEqual({ type: "delete", shapeId: "r1" });
    expect(parseCommand("move r1 -10 20.5")).toEqual({
      type: "move",
      shapeId: "r1",
      dx: -10,
      dy: 20.5,
    });
    expect(parseCommand("scale r1 2")).toEqual({
      type: "scale",
      shapeId: "r1",
      factor: 2,
    });
    expect(parseCommand("set r1 fill #f5a623")).toEqual({
      type: "set",
      shapeId: "r1",
      attribute: "fill",
      value: "#f5a623",
    });
    expect(parseCommand("set r1 width 120")).toEqual({
      type: "set",
      shapeId: "r1",
      attribute: "width",
      value: 120,
    });
    expect(parseCommand('set t1 text "更新后的标题"')).toEqual({
      type: "set",
      shapeId: "t1",
      attribute: "text",
      value: "更新后的标题",
    });
    expect(parseCommand("group g1 r1 c1")).toEqual({
      type: "group",
      containerId: "g1",
      memberIds: ["r1", "c1"],
    });
    expect(parseCommand("ungroup g1")).toEqual({
      type: "ungroup",
      containerId: "g1",
    });
    expect(parseCommand("addto g1 r1")).toEqual({
      type: "addto",
      containerId: "g1",
      shapeId: "r1",
    });
    expect(parseCommand("front r1")).toEqual({
      type: "reorder",
      shapeId: "r1",
      position: "front",
    });
    expect(parseCommand("back r1")).toEqual({
      type: "reorder",
      shapeId: "r1",
      position: "back",
    });
  });

  it("解析显示、历史和会话命令", () => {
    expect(parseCommand("tree")).toEqual({ type: "tree" });
    expect(parseCommand("tree g1")).toEqual({ type: "tree", shapeId: "g1" });
    expect(parseCommand("show c1")).toEqual({ type: "show", shapeId: "c1" });
    expect(parseCommand("help")).toEqual({ type: "help" });
    expect(parseCommand("undo")).toEqual({ type: "undo" });
    expect(parseCommand("redo")).toEqual({ type: "redo" });
    expect(parseCommand("exit")).toEqual({ type: "exit" });
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
