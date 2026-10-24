import { describe, expect, it } from "vitest";
import { Document } from "../../../src/core/document/Document";
import { ShapePlacement } from "../../../src/protocol/commands/memento/ShapePlacement";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { DocumentError } from "../../../src/protocol/errors/domain/DocumentError";
import { CircleShape } from "../../../src/protocol/shapes/concrete/CircleShape";
import { GroupShape } from "../../../src/protocol/shapes/concrete/GroupShape";
import { RectShape } from "../../../src/protocol/shapes/concrete/RectShape";

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

describe("Document 恢复能力", () => {
  it("按捕获的位置恢复已删除的根级子树", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 1, 1);
    const second = new GroupShape("second", [new CircleShape("child", 1, 1, 2)]);
    const third = new RectShape("third", 2, 2, 3, 3);
    document.addShape(first);
    document.addShape(second);
    document.addShape(third);

    const placement = document.capturePlacement("second");
    document.deleteShape("second");
    document.restorePlacements([placement]);

    expect(document.getRootShapes()).toEqual([first, second, third]);
    expect(document.getParentId("second")).toBeUndefined();
    expect(document.getParentId("child")).toBe("second");
    expect(document.getIndexInParent("second")).toBe(1);
  });

  it("恢复已注册图形时支持同父级换位和跨父级迁移", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 1, 1);
    const second = new RectShape("second", 0, 0, 1, 1);
    const third = new RectShape("third", 0, 0, 1, 1);
    const source = new GroupShape("source", [first, second, third]);
    const target = new GroupShape("target");
    document.addShape(source);
    document.addShape(target);

    const rootPlacement = document.capturePlacement("source");
    document.reorderShape("source", "back");
    expect(document.getRootShapes()).toEqual([target, source]);
    document.restorePlacements([rootPlacement]);
    expect(document.getRootShapes()).toEqual([source, target]);

    const nestedPlacement = document.capturePlacement("second");
    document.addToContainer("target", "second");
    expect(document.getChildren("source")).toEqual([first, third]);
    document.restorePlacements([nestedPlacement]);
    expect(document.getChildren("source")).toEqual([first, second, third]);
    expect(document.getParentId("second")).toBe("source");
  });

  it("多个 placement 按父节点和索引升序恢复", () => {
    const document = new Document();
    const parent = new GroupShape("parent");
    const first = new RectShape("first", 0, 0, 1, 1);
    const second = new RectShape("second", 0, 0, 1, 1);
    const third = new RectShape("third", 0, 0, 1, 1);
    const fourth = new RectShape("fourth", 0, 0, 1, 1);
    parent.addChild(first);
    parent.addChild(second);
    parent.addChild(third);
    parent.addChild(fourth);
    document.addShape(parent);

    const secondPlacement = document.capturePlacement("second");
    const fourthPlacement = document.capturePlacement("fourth");
    document.groupShapes("cluster", ["fourth", "second"]);
    document.restorePlacements([fourthPlacement, secondPlacement]);
    document.deleteShape("cluster");

    expect(document.getChildren("parent")).toEqual([
      first,
      second,
      third,
      fourth,
    ]);
  });

  it("restoreGroup 把容器恢复到原父级和索引", () => {
    const document = new Document();
    const parent = new GroupShape("parent");
    const first = new RectShape("first", 0, 0, 1, 1);
    const nested = new RectShape("nested", 0, 0, 1, 1);
    const container = new GroupShape("container", [nested]);
    const tail = new RectShape("tail", 0, 0, 1, 1);
    parent.addChild(first);
    parent.addChild(container);
    parent.addChild(tail);
    document.addShape(parent);

    const placement = document.capturePlacement("container");
    document.ungroupShapes("container");
    expect(document.getChildren("parent")).toEqual([first, nested, tail]);

    document.restoreGroup(placement);

    expect(document.getChildren("parent")).toEqual([first, container, tail]);
    expect(container.getChildren()).toEqual([nested]);
    expect(document.getParentId("nested")).toBe("container");
  });

  it("restoreGroup 支持空容器和单子节点容器", () => {
    const emptyDocument = new Document();
    const emptyParent = new GroupShape("parent");
    const emptyContainer = new GroupShape("empty");
    emptyParent.addChild(emptyContainer);
    emptyDocument.addShape(emptyParent);

    const emptyPlacement = emptyDocument.capturePlacement("empty");
    emptyDocument.ungroupShapes("empty");
    emptyDocument.restoreGroup(emptyPlacement);
    expect(emptyDocument.getChildren("parent")).toEqual([emptyContainer]);

    const singleDocument = new Document();
    const singleParent = new GroupShape("parent");
    const child = new RectShape("child", 0, 0, 1, 1);
    const singleContainer = new GroupShape("single", [child]);
    singleParent.addChild(singleContainer);
    singleDocument.addShape(singleParent);

    const singlePlacement = singleDocument.capturePlacement("single");
    singleDocument.ungroupShapes("single");
    singleDocument.restoreGroup(singlePlacement);
    expect(singleDocument.getChildren("parent")).toEqual([singleContainer]);
    expect(singleDocument.getParentId("child")).toBe("single");
  });

  it("非法恢复不会改变现有结构", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 1, 1);
    const second = new RectShape("second", 0, 0, 1, 1);
    document.addShape(first);
    document.addShape(second);

    const placement = document.capturePlacement("first");
    const invalidPlacement = new ShapePlacement(
      placement.getShape(),
      placement.getParentId(),
      99,
    );

    expectDocumentError(
      () => document.restorePlacements([invalidPlacement]),
      CommandErrorCode.InvalidArgument,
      "invalid child index: 99",
    );
    expect(document.getRootShapes()).toEqual([first, second]);
  });

  it("多个 placement 中任一非法时整体不修改", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 1, 1);
    const second = new RectShape("second", 0, 0, 1, 1);
    const third = new RectShape("third", 0, 0, 1, 1);
    document.addShape(first);
    document.addShape(second);
    document.addShape(third);

    const firstPlacement = document.capturePlacement("first");
    const secondPlacement = document.capturePlacement("second");
    const invalidPlacement = new ShapePlacement(third, undefined, 99);

    expectDocumentError(
      () => document.restorePlacements([
        firstPlacement,
        invalidPlacement,
        secondPlacement,
      ]),
      CommandErrorCode.InvalidArgument,
      "invalid child index: 99",
    );
    expect(document.getRootShapes()).toEqual([first, second, third]);
  });

  it("捕获并恢复叶子与嵌套组的属性", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 1, 1, "red");
    const second = new CircleShape("second", 0, 0, 2);
    const nested = new GroupShape("nested", [second]);
    const group = new GroupShape("group", [first, nested]);
    document.addShape(group);

    const snapshot = document.captureAttribute("group", "fill");
    document.setAttribute("group", "fill", "blue");
    expect(first.getAttribute("fill")).toBe("blue");
    expect(second.getAttribute("fill")).toBe("blue");

    document.restoreAttribute(snapshot);
    expect(first.getAttribute("fill")).toBe("red");
    expect(second.getAttribute("fill")).toBeUndefined();
  });
});
