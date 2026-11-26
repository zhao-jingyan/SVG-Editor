import { describe, expect, it } from "vitest";
import { TreeDisplay } from "@/core/display/TreeDisplay";
import { Document } from "@/core/document/Document";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { BoxShape } from "@/_plugin/shapes/BoxShape/BoxShape";
import { BoxTypeLabelDecorator } from "@/_plugin/shapes/BoxShape/BoxTypeLabelDecorator";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";

describe("BoxTypeLabelDecorator", () => {
  function render(document: Document): string {
    const decorators = new TreeDecoratorRegistry();
    decorators.register(new BoxTypeLabelDecorator());
    return new TreeDisplay(decorators).render(document);
  }

  it("只给 box 容器行追加 (box)，普通 g 与叶子不加", () => {
    const document = new Document(100, 100);
    document.addShape(BoxShape.create("n1", 0, 0, 40, 20, "t"));
    document.addShape(new GroupShape("g1", [new RectShape("r1", 0, 0, 1, 1)]));

    const lines = render(document).split("\n");

    expect(lines.find((line) => line.includes("g#n1"))).toMatch(/g#n1 \(box\)$/);
    expect(lines.find((line) => line.includes("g#g1"))).toMatch(/g#g1$/);
    expect(lines.find((line) => line.includes("rect#n1-rect"))).not.toContain(
      "(box)",
    );
  });

  it("未注册任何装饰器时 tree 输出与 Phase 1 一致（无标签）", () => {
    const document = new Document(100, 100);
    document.addShape(BoxShape.create("n1", 0, 0, 40, 20, "t"));

    expect(new TreeDisplay().render(document)).not.toContain("(box)");
  });
});
