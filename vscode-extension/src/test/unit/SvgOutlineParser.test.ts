import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SvgDocumentNode } from "../../model/SvgDocumentNode";
import { SvgElementNode } from "../../model/SvgElementNode";
import { SvgOutlineParser } from "../../parser/SvgOutlineParser";

const parser = new SvgOutlineParser();

function parseRoot(source: string): SvgElementNode {
  const document = parser.parse(source);

  assert.ok(document instanceof SvgDocumentNode);
  return document.getRoot();
}

function sourceAt(source: string, node: SvgElementNode): string {
  return source.slice(
    node.getRange().getStart(),
    node.getRange().getEnd(),
  );
}

describe("SvgOutlineParser", () => {
  it("保留嵌套层级、id 和源码范围", () => {
    const source = [
      '<?xml version="1.0"?>',
      '<svg xmlns="http://www.w3.org/2000/svg">',
      '  <g id="flowchart">',
      '    <rect id="start" x="20" y="20" />',
      "    <text>开始</text>",
      "  </g>",
      "</svg>",
    ].join("\n");
    const root = parseRoot(source);
    const group = root.getChildren()[0];

    assert.equal(root.getLabel(), "svg");
    assert.equal(group.getLabel(), "g#flowchart");
    assert.deepEqual(
      group.getChildren().map((child) => child.getLabel()),
      ["rect#start", "text"],
    );
    assert.match(sourceAt(source, group), /^<g id="flowchart">/);
    assert.match(sourceAt(source, group), /<\/g>$/);
  });

  it("跳过注释、声明和 CDATA", () => {
    const source = [
      "<!DOCTYPE svg [<!ENTITY title \"演示\">]>",
      "<svg>",
      "  <!-- 节点注释 -->",
      "  <g id='layer'>",
      "    <![CDATA[不是元素]]>",
      "    <rect/>",
      "  </g>",
      "</svg>",
    ].join("\n");
    const root = parseRoot(source);
    const group = root.getChildren()[0];

    assert.equal(group.getLabel(), "g#layer");
    assert.equal(group.getChildren()[0].getLabel(), "rect");
  });

  it("不会把其他属性值中的 id 文本识别为 id 属性", () => {
    const root = parseRoot(
      '<svg><rect data-note="node id=wrong" id="right"/></svg>',
    );

    assert.equal(root.getChildren()[0].getLabel(), "rect#right");
  });

  it("不完整 XML 返回空结果", () => {
    assert.equal(parser.parse("<svg><g>"), undefined);
    assert.equal(parser.parse("<svg><g></svg>"), undefined);
    assert.equal(parser.parse("<svg/><svg/>"), undefined);
    assert.equal(parser.parse("普通文本"), undefined);
  });
});
