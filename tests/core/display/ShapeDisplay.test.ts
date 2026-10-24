import { describe, expect, it } from "vitest";
import { ShapeDetailVisitor } from "../../../src/core/display/ShapeDetailVisitor";
import { ShapeSummaryVisitor } from "../../../src/core/display/ShapeSummaryVisitor";
import { TreeDisplay } from "../../../src/core/display/TreeDisplay";
import { Document } from "../../../src/core/document/Document";
import { CircleShape } from "../../../src/protocol/shapes/concrete/CircleShape";
import { EllipseShape } from "../../../src/protocol/shapes/concrete/EllipseShape";
import { GroupShape } from "../../../src/protocol/shapes/concrete/GroupShape";
import { LineShape } from "../../../src/protocol/shapes/concrete/LineShape";
import { RectShape } from "../../../src/protocol/shapes/concrete/RectShape";
import { TextShape } from "../../../src/protocol/shapes/concrete/TextShape";

describe("图形显示 Visitor", () => {
  const summary = new ShapeSummaryVisitor();
  const detail = new ShapeDetailVisitor();

  it("为全部叶子类型生成内联摘要", () => {
    expect(new RectShape("r1", 0, 0, 10, 20, "red").accept(summary)).toBe(
      "rect#r1 x=0 y=0 w=10 h=20 fill=red",
    );
    expect(new CircleShape("c1", 5, 6, 7).accept(summary)).toBe(
      "circle#c1 cx=5 cy=6 r=7",
    );
    expect(new EllipseShape("e1", 1, 2, 3, 4).accept(summary)).toBe(
      "ellipse#e1 cx=1 cy=2 rx=3 ry=4",
    );
    expect(new LineShape("l1", 0, 1, 2, 3, "black").accept(summary)).toBe(
      "line#l1 (0,1) -> (2,3) stroke=black",
    );
    expect(new TextShape("t1", 20, 40, 'My "title"').accept(summary)).toBe(
      'text#t1 (20,40) "My \\"title\\""',
    );
  });

  it("为全部叶子类型生成属性明细", () => {
    expect(new RectShape("r1", 0, 0, 10, 20, "red").accept(detail)).toEqual([
      "x=0 y=0 w=10 h=20",
      "fill=red",
    ]);
    expect(new CircleShape("c1", 5, 6, 7).accept(detail)).toEqual([
      "cx=5 cy=6 r=7",
    ]);
    expect(new EllipseShape("e1", 1, 2, 3, 4).accept(detail)).toEqual([
      "cx=1 cy=2 rx=3 ry=4",
    ]);
    expect(new LineShape("l1", 0, 1, 2, 3, "black").accept(detail)).toEqual([
      "x1=0 y1=1 x2=2 y2=3",
      "stroke=black",
    ]);
    expect(new TextShape("t1", 20, 40, "title").accept(detail)).toEqual([
      "x=20 y=40",
      'text="title"',
    ]);
  });

  it("group 摘要只保留标识，明细显示子节点数", () => {
    const group = new GroupShape("g1", [
      new RectShape("r1", 0, 0, 1, 1),
      new CircleShape("c1", 0, 0, 1),
    ]);

    expect(group.accept(summary)).toBe("g#g1");
    expect(group.accept(detail)).toEqual(["children=2"]);
  });
});

describe("TreeDisplay", () => {
  it("渲染全文档、嵌套缩进和属性对齐", () => {
    const document = new Document(800, 600);
    const inner = new GroupShape("inner", [new CircleShape("c1", 5, 6, 7)]);
    document.addShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
    document.addShape(new TextShape("title", 20, 40, "My Diagram"));
    document.addShape(new GroupShape("scene", [inner, new RectShape("box", 1, 2, 3, 4)]));

    expect(new TreeDisplay().render(document)).toBe([
      "svg (800x600)",
      "├── rect#bg     x=0 y=0 w=800 h=600 fill=#ffffff",
      '├── text#title  (20,40) "My Diagram"',
      "└── g#scene",
      "    ├── g#inner",
      "    │   └── circle#c1   cx=5 cy=6 r=7",
      "    └── rect#box    x=1 y=2 w=3 h=4",
    ].join("\n"));
  });

  it("tree id 只渲染指定子树", () => {
    const document = new Document(400, 300);
    document.addShape(new GroupShape("scene", [
      new RectShape("box", 1, 2, 3, 4),
      new CircleShape("c1", 5, 6, 7),
    ]));

    expect(new TreeDisplay().render(document, "scene")).toBe([
      "g#scene",
      "├── rect#box   x=1 y=2 w=3 h=4",
      "└── circle#c1  cx=5 cy=6 r=7",
    ].join("\n"));
  });
});
