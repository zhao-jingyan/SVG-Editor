import { describe, expect, it } from "vitest";
import { Document } from "../../../src/core/document/Document";
import { SvgDocumentParser } from "../../../src/core/io/SvgDocumentParser";
import { SvgDocumentWriter } from "../../../src/core/io/SvgDocumentWriter";
import { CircleShape } from "../../../src/protocol/shapes/concrete/CircleShape";
import { GroupShape } from "../../../src/protocol/shapes/concrete/GroupShape";
import { RectShape } from "../../../src/protocol/shapes/concrete/RectShape";
import { TextShape } from "../../../src/protocol/shapes/concrete/TextShape";

describe("SvgDocumentWriter", () => {
  it("输出标准 SVG、递归 group、样式与转义文本", () => {
    const document = new Document(400, 200);
    document.addShape(new RectShape("r1", 0, 0, 400, 200, "red"));
    document.addShape(new TextShape("t1", 10, 20, 'A & <B> "C"'));
    document.addShape(new GroupShape("g1", [
      new CircleShape("c1", 5, 6, 7),
      new GroupShape("empty"),
    ]));

    const output = new SvgDocumentWriter().render(document);

    expect(output).toBe([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">',
      '  <rect id="r1" x="0" y="0" width="400" height="200" fill="red"/>',
      '  <text id="t1" x="10" y="20">A &amp; &lt;B&gt; "C"</text>',
      '  <g id="g1">',
      '    <circle id="c1" cx="5" cy="6" r="7"/>',
      '    <g id="empty"/>',
      '  </g>',
      '</svg>',
      '',
    ].join("\n"));
    expect(new SvgDocumentWriter().countElements(document)).toBe(5);
  });

  it("写出结果可再次读回并保持树顺序与属性", () => {
    const document = new Document(320, 240);
    document.addShape(new GroupShape("scene", [
      new RectShape("r1", 1, 2, 3, 4, "#fff"),
      new CircleShape("c1", 5, 6, 7),
    ]));
    document.addShape(new TextShape("t1", 8, 9, "round trip"));

    const content = new SvgDocumentWriter().render(document);
    const result = new SvgDocumentParser().parse(content);
    const restored = result.getDocument();
    const scene = restored.getShape("scene");

    expect(result.getElementCount()).toBe(4);
    expect(restored.getWidth()).toBe(320);
    expect(restored.getRootShapes().map((shape) => shape.getId())).toEqual(["scene", "t1"]);
    expect(scene).toBeInstanceOf(GroupShape);

    if (scene instanceof GroupShape) {
      expect(scene.getChildren().map((shape) => shape.getId())).toEqual(["r1", "c1"]);
    }

    expect(restored.getShape("r1").getAttribute("fill")).toBe("#fff");
    expect(restored.getShape("c1").getAttribute("r")).toBe(7);
    expect(restored.getShape("t1").getAttribute("text")).toBe("round trip");
  });
});
