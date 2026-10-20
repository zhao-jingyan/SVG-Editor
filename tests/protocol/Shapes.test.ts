import { describe, expect, it } from "vitest";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../src/protocol/errors/ProtocolError";
import { ShapeError } from "../../src/protocol/errors/ShapeError";
import { CircleShape } from "../../src/protocol/shapes/CircleShape";
import { EllipseShape } from "../../src/protocol/shapes/EllipseShape";
import { GroupShape } from "../../src/protocol/shapes/GroupShape";
import { LineShape } from "../../src/protocol/shapes/LineShape";
import { RectShape } from "../../src/protocol/shapes/RectShape";
import { Shape } from "../../src/protocol/shapes/Shape";
import { ShapeFactory } from "../../src/protocol/shapes/ShapeFactory";
import { ShapeType } from "../../src/protocol/shapes/ShapeType";
import { TextShape } from "../../src/protocol/shapes/TextShape";

function expectShapeError(action: () => void, code: CommandErrorCode): void {
  let caught: unknown;

  try {
    action();
  } catch (error: unknown) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(ShapeError);
  expect(caught).toBeInstanceOf(ProtocolError);

  if (caught instanceof ShapeError) {
    expect(caught.getCode()).toBe(code);
  }
}

describe("Shape 多态模型", () => {
  const factory = new ShapeFactory();

  it("工厂创建六种具体形状", () => {
    const rect = factory.create("rect", "r1", ["10", "20", "100", "50", "#fff"]);
    const circle = factory.create("circle", "c1", ["100", "100", "20", "red"]);
    const ellipse = factory.create("ellipse", "e1", ["1", "2", "3", "4", "blue"]);
    const line = factory.create("line", "l1", ["0", "0", "10", "10", "black"]);
    const text = factory.create("text", "t1", ["20", "40", "My Diagram"]);
    const group = factory.create("g", "g1", []);

    expect(rect).toBeInstanceOf(RectShape);
    expect(circle).toBeInstanceOf(CircleShape);
    expect(ellipse).toBeInstanceOf(EllipseShape);
    expect(line).toBeInstanceOf(LineShape);
    expect(text).toBeInstanceOf(TextShape);
    expect(group).toBeInstanceOf(GroupShape);

    const shapes: Shape[] = [rect, circle, ellipse, line, text, group];

    for (const shape of shapes) {
      expect(shape).toBeInstanceOf(Shape);
    }

    expect(rect.getType()).toBe(ShapeType.Rect);
    expect(circle.getType()).toBe(ShapeType.Circle);
    expect(ellipse.getType()).toBe(ShapeType.Ellipse);
    expect(line.getType()).toBe(ShapeType.Line);
    expect(text.getType()).toBe(ShapeType.Text);
    expect(group.getType()).toBe(ShapeType.Group);
    expect(rect.getId()).toBe("r1");
    expect(rect.getAttribute("fill")).toBe("#fff");
    expect(circle.getAttribute("fill")).toBe("red");
    expect(ellipse.getAttribute("fill")).toBe("blue");
    expect(line.getAttribute("stroke")).toBe("black");
    expect(text.getAttribute("text")).toBe("My Diagram");
  });

  it("构造器拒绝空 id 和非有限数字", () => {
    expectShapeError(
      () => new RectShape("", 0, 0, 10, 10),
      CommandErrorCode.InvalidArgument,
    );
    expectShapeError(
      () => new CircleShape("c1", Number.NaN, 0, 10),
      CommandErrorCode.InvalidNumber,
    );
    expectShapeError(
      () => new TextShape("t1", 0, Number.POSITIVE_INFINITY, "text"),
      CommandErrorCode.InvalidNumber,
    );
  });

  it("每种叶子形状独立执行 move 与 scale", () => {
    const rect = new RectShape("r1", 10, 20, 100, 50);
    const circle = new CircleShape("c1", 100, 200, 20);
    const ellipse = new EllipseShape("e1", 1, 2, 3, 4);
    const line = new LineShape("l1", 0, 0, 10, 10);
    const text = new TextShape("t1", 20, 40, "标题");

    rect.move(5, -5);
    circle.move(5, -5);
    ellipse.move(5, -5);
    line.move(5, -5);
    text.move(5, -5);

    expect(rect.getAttribute("x")).toBe(15);
    expect(rect.getAttribute("y")).toBe(15);
    expect(circle.getAttribute("cx")).toBe(105);
    expect(circle.getAttribute("cy")).toBe(195);
    expect(ellipse.getAttribute("cx")).toBe(6);
    expect(ellipse.getAttribute("cy")).toBe(-3);
    expect(line.getAttribute("x1")).toBe(5);
    expect(line.getAttribute("y2")).toBe(5);
    expect(text.getAttribute("x")).toBe(25);
    expect(text.getAttribute("y")).toBe(35);

    rect.scale(2);
    circle.scale(2);
    ellipse.scale(2);
    line.scale(2);
    text.scale(2);

    expect(rect.getAttribute("x")).toBe(30);
    expect(rect.getAttribute("width")).toBe(200);
    expect(circle.getAttribute("cx")).toBe(210);
    expect(circle.getAttribute("r")).toBe(40);
    expect(ellipse.getAttribute("rx")).toBe(6);
    expect(ellipse.getAttribute("ry")).toBe(8);
    expect(line.getAttribute("x2")).toBe(30);
    expect(line.getAttribute("y2")).toBe(10);
    expect(text.getAttribute("x")).toBe(50);
    expect(text.getAttribute("text")).toBe("标题");
  });

  it("非法缩放不修改任何几何状态", () => {
    const rect = new RectShape("r1", 10, 20, 100, 50);

    expectShapeError(() => rect.scale(0), CommandErrorCode.InvalidScale);
    expectShapeError(() => rect.scale(-1), CommandErrorCode.InvalidScale);
    expectShapeError(() => rect.scale(Number.NaN), CommandErrorCode.InvalidScale);
    expect(rect.getAttribute("x")).toBe(10);
    expect(rect.getAttribute("width")).toBe(100);
  });

  it("每种形状通过多态更新自身属性并拒绝未知属性", () => {
    const rect = new RectShape("r1", 10, 20, 100, 50);
    const circle = new CircleShape("c1", 100, 200, 20);
    const ellipse = new EllipseShape("e1", 1, 2, 3, 4);
    const line = new LineShape("l1", 0, 0, 10, 10);
    const text = new TextShape("t1", 20, 40, "旧标题");

    rect.setAttribute("x", 15);
    rect.setAttribute("fill", "red");
    rect.setAttribute("stroke", "black");
    rect.setAttribute("stroke-width", 2);
    circle.setAttribute("r", 30);
    ellipse.setAttribute("ry", 8);
    line.setAttribute("x2", 80);
    line.setAttribute("stroke", "blue");
    text.setAttribute("text", "新标题");

    expect(rect.getAttribute("x")).toBe(15);
    expect(rect.getAttribute("fill")).toBe("red");
    expect(rect.getAttribute("stroke")).toBe("black");
    expect(rect.getAttribute("stroke-width")).toBe(2);
    expect(circle.getAttribute("r")).toBe(30);
    expect(ellipse.getAttribute("ry")).toBe(8);
    expect(line.getAttribute("x2")).toBe(80);
    expect(line.getAttribute("stroke")).toBe("blue");
    expect(text.getAttribute("text")).toBe("新标题");

    expectShapeError(
      () => circle.setAttribute("width", 10),
      CommandErrorCode.UnknownAttribute,
    );
    expectShapeError(
      () => line.setAttribute("text", "line"),
      CommandErrorCode.UnknownAttribute,
    );
    expectShapeError(
      () => text.setAttribute("r", 1),
      CommandErrorCode.UnknownAttribute,
    );
    expectShapeError(
      () => rect.setAttribute("width", "wide"),
      CommandErrorCode.InvalidArgument,
    );
  });

  it("GroupShape 递归执行移动、缩放和样式传播", () => {
    const rect = new RectShape("r1", 10, 20, 100, 50);
    const circle = new CircleShape("c1", 100, 200, 20);
    const text = new TextShape("t1", 20, 40, "标题");
    const nested = new GroupShape("inner", [circle, text]);
    const group = new GroupShape("outer", [rect, nested]);

    group.move(10, 20);
    group.scale(2);
    group.setAttribute("fill", "red");
    group.setAttribute("stroke-width", 3);

    expect(rect.getAttribute("x")).toBe(40);
    expect(rect.getAttribute("y")).toBe(80);
    expect(rect.getAttribute("width")).toBe(200);
    expect(rect.getAttribute("fill")).toBe("red");
    expect(rect.getAttribute("stroke-width")).toBe(3);
    expect(circle.getAttribute("cx")).toBe(220);
    expect(circle.getAttribute("cy")).toBe(440);
    expect(circle.getAttribute("fill")).toBe("red");
    expect(text.getAttribute("x")).toBe(60);
    expect(text.getAttribute("y")).toBe(120);
    expect(text.getAttribute("fill")).toBe("red");
    expect(nested.getChildren()).toEqual([circle, text]);
  });

  it("GroupShape 保持顺序、只读暴露子节点并拒绝重复 id", () => {
    const rect = new RectShape("r1", 0, 0, 10, 10);
    const circle = new CircleShape("c1", 0, 0, 5);
    const group = new GroupShape("g1", [rect, circle]);

    expect(group.getChildren()).toEqual([rect, circle]);
    expect(group.removeChild("r1")).toBe(rect);
    expect(group.getChildren()).toEqual([circle]);

    const children = group.getChildren() as Shape[];
    children.pop();
    expect(group.getChildren()).toEqual([circle]);
    expectShapeError(
      () => group.addChild(new RectShape("c1", 0, 0, 1, 1)),
      CommandErrorCode.DuplicateId,
    );
    expectShapeError(
      () => group.addChild(new RectShape("g1", 0, 0, 1, 1)),
      CommandErrorCode.DuplicateId,
    );
  });

  it("GroupShape 只接受公共样式并保持失败前状态", () => {
    const rect = new RectShape("r1", 0, 0, 10, 10);
    const group = new GroupShape("g1", [rect]);

    expectShapeError(
      () => group.setAttribute("width", 100),
      CommandErrorCode.UnknownAttribute,
    );
    expectShapeError(
      () => group.setAttribute("text", "group"),
      CommandErrorCode.UnknownAttribute,
    );
    expectShapeError(
      () => group.setAttribute("fill", 10),
      CommandErrorCode.InvalidArgument,
    );
    expect(rect.getAttribute("width")).toBe(10);

    expectShapeError(() => group.scale(0), CommandErrorCode.InvalidScale);
    expect(rect.getAttribute("width")).toBe(10);

    const empty = new GroupShape("empty");
    expect(() => empty.setAttribute("fill", "red")).not.toThrow();
  });

  it("ShapeFactory 报告未知类型和非法参数", () => {
    expectShapeError(
      () => factory.create("hexagon", "h1", []),
      CommandErrorCode.UnknownShapeType,
    );
    expectShapeError(
      () => factory.create("rect", "r1", ["x", "0", "10", "10"]),
      CommandErrorCode.InvalidNumber,
    );
    expectShapeError(
      () => factory.create("circle", "c1", ["0", "0"]),
      CommandErrorCode.InvalidArgument,
    );
    expectShapeError(
      () => factory.create("line", "l1", ["0", "0", "1", "1", ""]),
      CommandErrorCode.InvalidArgument,
    );
  });
});
