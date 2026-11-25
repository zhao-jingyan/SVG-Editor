import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SvgDocumentNode } from "../../model/SvgDocumentNode";
import { SvgElementNode } from "../../model/SvgElementNode";
import { SvgOutlineParser } from "../../parser/SvgOutlineParser";
import { SvgOutlineVisitor } from "../../visitor/SvgOutlineVisitor";

describe("SvgOutlineVisitor", () => {
  it("通过双分派递归生成大纲", () => {
    const document = new SvgOutlineParser().parse(
      '<svg><g id="layer"><circle id="dot"/></g></svg>',
    );

    assert.ok(document instanceof SvgDocumentNode);
    assert.ok(document.getRoot() instanceof SvgElementNode);

    const outline = document.accept(new SvgOutlineVisitor());

    assert.equal(outline.getLabel(), "svg");
    assert.equal(outline.getChildren()[0].getLabel(), "g#layer");
    assert.equal(
      outline.getChildren()[0].getChildren()[0].getLabel(),
      "circle#dot",
    );
  });
});
