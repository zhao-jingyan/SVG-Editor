import { describe, expect, it } from "vitest";
import { SvgDocumentParser } from "../../../src/core/io/SvgDocumentParser";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { DocumentError } from "../../../src/protocol/errors/domain/DocumentError";
import { GroupShape } from "../../../src/protocol/shapes/concrete/GroupShape";

function expectDocumentError(
  action: () => void,
  code: CommandErrorCode,
  message: string,
): void {
  let caught: unknown;

  try {
    action();
  } catch (error: unknown) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(DocumentError);

  if (caught instanceof DocumentError) {
    expect(caught.getCode()).toBe(code);
    expect(caught.message).toBe(message);
  }
}

describe("SvgDocumentParser", () => {
  it("解析六类图形、嵌套顺序、样式与缺 id 警告", () => {
    const parser = new SvgDocumentParser();
    const result = parser.parse(`<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect x="0" y="0" width="400" height="300" fill="#ffffff" stroke="black" stroke-width="2"/>
  <text id="t1" x="10" y="290">imported &amp; ready</text>
  <circle id="c1" cx="50" cy="50" r="10"/>
  <g id="g1">
    <rect id="r2" x="0" y="0" width="10" height="10"/>
    <circle id="c2" cx="5" cy="5" r="2"/>
  </g>
  <ellipse id="e1" cx="1" cy="2" rx="3" ry="4"/>
  <line id="l1" x1="0" y1="1" x2="2" y2="3" stroke="red"/>
</svg>`);
    const document = result.getDocument();
    const group = document.getShape("g1");

    expect(result.getWarnings()).toEqual([
      "warning: assigned id rect1 to unnamed <rect>",
    ]);
    expect(result.getElementCount()).toBe(8);
    expect(document.getWidth()).toBe(400);
    expect(document.getHeight()).toBe(300);
    expect(document.getShape("rect1").getAttribute("stroke-width")).toBe(2);
    expect(document.getShape("rect1").getAttribute("fill")).toBe("#ffffff");
    expect(document.getShape("t1").getAttribute("text")).toBe("imported & ready");
    expect(group).toBeInstanceOf(GroupShape);

    if (group instanceof GroupShape) {
      expect(group.getChildren().map((shape) => shape.getId())).toEqual(["r2", "c2"]);
    }

    expect(document.getRootShapes().map((shape) => shape.getId())).toEqual([
      "rect1",
      "t1",
      "c1",
      "g1",
      "e1",
      "l1",
    ]);
  });

  it("自动 id 避开后续显式 id", () => {
    const parser = new SvgDocumentParser();
    const result = parser.parse(`<svg width="10" height="10">
  <rect x="0" y="0" width="1" height="1"/>
  <rect id="rect1" x="0" y="0" width="2" height="2"/>
</svg>`);

    expect(result.getWarnings()).toEqual([
      "warning: assigned id rect2 to unnamed <rect>",
    ]);
    expect(result.getDocument().getRootShapes().map((shape) => shape.getId())).toEqual([
      "rect2",
      "rect1",
    ]);
  });

  it("支持 viewBox 回退，并拒绝重复 id 与损坏输入", () => {
    const parser = new SvgDocumentParser();
    const result = parser.parse(
      '<svg viewBox="0 0 320 240"><rect id="r1" x="0" y="0" width="1" height="1"/></svg>',
    );
    expect(result.getDocument().getWidth()).toBe(320);
    expect(result.getDocument().getHeight()).toBe(240);

    expectDocumentError(
      () => parser.parse(`<svg width="10" height="10">
        <rect id="r1" x="0" y="0" width="1" height="1"/>
        <circle id="r1" cx="0" cy="0" r="1"/>
      </svg>`),
      CommandErrorCode.DuplicateId,
      "id already exists: r1",
    );
    expectDocumentError(
      () => parser.parse("<not-svg/>"),
      CommandErrorCode.InvalidArgument,
      "invalid SVG: missing <svg> root",
    );
    expectDocumentError(
      () => parser.parse('<svg width="10" height="10"><rect id="r1" x="0" width="1" height="1"/></svg>'),
      CommandErrorCode.InvalidArgument,
      "invalid <rect>: missing attribute y",
    );
    expectDocumentError(
      () => parser.parse("<svg"),
      CommandErrorCode.InvalidArgument,
      "invalid SVG: invalid XML",
    );
  });
});
