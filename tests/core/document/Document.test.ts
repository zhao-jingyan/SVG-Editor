import { describe, expect, it } from "vitest";
import { Document } from "../../../src/core/document/Document";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { ErrorSource } from "../../../src/protocol/errors/ErrorSource";
import { ProtocolError } from "../../../src/protocol/errors/ProtocolError";
import { CircleShape } from "../../../src/protocol/shapes/concrete/CircleShape";
import { GroupShape } from "../../../src/protocol/shapes/concrete/GroupShape";
import { RectShape } from "../../../src/protocol/shapes/concrete/RectShape";

function expectDocumentProtocolError(
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

  expect(caught).toBeInstanceOf(ProtocolError);

  if (caught instanceof ProtocolError) {
    expect(caught.getSource()).toBe(ErrorSource.Document);
    expect(caught.getCode()).toBe(code);
    expect(caught.message).toBe(message);
  }
}

describe("Document 聚合根", () => {
  it("提供默认画布并原子校验 resize", () => {
    const document = new Document();

    expect(document.getWidth()).toBe(800);
    expect(document.getHeight()).toBe(600);

    document.resize(1024, 768);
    expect(document.getWidth()).toBe(1024);
    expect(document.getHeight()).toBe(768);

    expectDocumentProtocolError(
      () => document.resize(0, 600),
      CommandErrorCode.InvalidNumber,
      "canvas width must be a positive finite number",
    );
    expect(document.getWidth()).toBe(1024);
    expect(document.getHeight()).toBe(768);

    expectDocumentProtocolError(
      () => document.resize(800, Number.NaN),
      CommandErrorCode.InvalidNumber,
      "canvas height must be a positive finite number",
    );
    expect(document.getWidth()).toBe(1024);
    expect(document.getHeight()).toBe(768);
  });

  it("添加根级和嵌套图形并维护全局索引", () => {
    const document = new Document();
    const group = new GroupShape("g1");
    const rect = new RectShape("r1", 0, 0, 10, 10);
    const circle = new CircleShape("c1", 20, 20, 5);

    document.addShape(group);
    document.addShape(rect, "g1");
    document.addShape(circle, "g1");

    expect(document.getRootShapes()).toEqual([group]);
    expect(document.getChildren()).toEqual([group]);
    expect(document.getChildren("g1")).toEqual([rect, circle]);
    expect(document.findShape("r1")).toBe(rect);
    expect(document.getShape("c1")).toBe(circle);
    expect(document.getParentId("g1")).toBeUndefined();
    expect(document.getParentId("r1")).toBe("g1");
    expect(document.getParentId("c1")).toBe("g1");
  });

  it("拒绝全局重复 id、缺失父容器和非容器父级", () => {
    const document = new Document();
    const rect = new RectShape("r1", 0, 0, 10, 10);
    document.addShape(rect);

    expectDocumentProtocolError(
      () => document.addShape(new CircleShape("r1", 0, 0, 5)),
      CommandErrorCode.DuplicateId,
      "id already exists: r1",
    );
    expectDocumentProtocolError(
      () => document.addShape(new RectShape("r2", 0, 0, 1, 1), "missing"),
      CommandErrorCode.ContainerNotFound,
      "no such container: missing",
    );
    expectDocumentProtocolError(
      () => document.addShape(new RectShape("r2", 0, 0, 1, 1), "r1"),
      CommandErrorCode.NotContainer,
      "not a container: r1",
    );
  });

  it("拒绝子树内部的重复 id 且不产生部分添加", () => {
    const document = new Document();
    const duplicateGroup = new GroupShape("outer", [
      new GroupShape("left", [new RectShape("duplicate", 0, 0, 1, 1)]),
      new GroupShape("right", [new RectShape("duplicate", 1, 1, 1, 1)]),
    ]);

    expectDocumentProtocolError(
      () => document.addShape(duplicateGroup),
      CommandErrorCode.DuplicateId,
      "id already exists: duplicate",
    );
    expect(document.findShape("outer")).toBeUndefined();
    expect(document.getRootShapes()).toEqual([]);
  });

  it("删除叶子和容器时清理整棵子树的索引", () => {
    const document = new Document();
    const group = new GroupShape("g1", [
      new RectShape("r1", 0, 0, 10, 10),
      new GroupShape("inner", [new CircleShape("c1", 5, 5, 2)]),
    ]);
    document.addShape(group);

    document.deleteShape("r1");
    expect(document.findShape("r1")).toBeUndefined();
    expect((document.getShape("g1") as GroupShape).getChildren()).toHaveLength(1);

    document.deleteShape("g1");
    expect(document.findShape("g1")).toBeUndefined();
    expect(document.findShape("inner")).toBeUndefined();
    expect(document.findShape("c1")).toBeUndefined();
    expect(document.getRootShapes()).toEqual([]);

    expectDocumentProtocolError(
      () => document.deleteShape("missing"),
      CommandErrorCode.ShapeNotFound,
      "no such shape: missing",
    );
  });

  it("通过 Document 委托 move、scale 和 set", () => {
    const document = new Document();
    const rect = new RectShape("r1", 10, 20, 100, 50);
    document.addShape(rect);

    document.moveShape("r1", 5, -5);
    document.scaleShape("r1", 2);
    document.setAttribute("r1", "fill", "red");

    expect(rect.getAttribute("x")).toBe(30);
    expect(rect.getAttribute("y")).toBe(30);
    expect(rect.getAttribute("width")).toBe(200);
    expect(rect.getAttribute("height")).toBe(100);
    expect(rect.getAttribute("fill")).toBe("red");

    expectDocumentProtocolError(
      () => document.moveShape("missing", 1, 1),
      CommandErrorCode.ShapeNotFound,
      "no such shape: missing",
    );
  });

  it("group 把成员按文档先序收编到根级新容器", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 10, 10);
    const middle = new GroupShape("middle");
    const last = new CircleShape("last", 10, 10, 2);
    document.addShape(first);
    document.addShape(middle);
    document.addShape(last);

    document.groupShapes("cluster", ["last", "first"]);

    const cluster = document.getShape("cluster");
    expect(cluster).toBeInstanceOf(GroupShape);
    expect(document.getRootShapes()).toEqual([middle, cluster]);
    expect(document.getParentId("first")).toBe("cluster");
    expect(document.getParentId("last")).toBe("cluster");

    if (cluster instanceof GroupShape) {
      expect(cluster.getChildren()).toEqual([first, last]);
    }
  });

  it("group 支持跨父节点收编并保持文档先序", () => {
    const document = new Document();
    const parent = new GroupShape("parent");
    const nested = new RectShape("nested", 0, 0, 10, 10);
    const root = new CircleShape("root", 0, 0, 2);
    parent.addChild(nested);
    document.addShape(parent);
    document.addShape(root);

    document.groupShapes("cluster", ["root", "nested"]);

    const cluster = document.getShape("cluster");
    expect(document.getRootShapes()).toEqual([parent, cluster]);
    expect((document.getShape("parent") as GroupShape).getChildren()).toEqual([]);
    expect(document.getParentId("nested")).toBe("cluster");
    expect(document.getParentId("root")).toBe("cluster");

    if (cluster instanceof GroupShape) {
      expect(cluster.getChildren()).toEqual([nested, root]);
    }
  });

  it("group 拒绝空成员、重复成员、重复容器 id 和祖先子孙冲突", () => {
    const document = new Document();
    const outer = new GroupShape("outer");
    const child = new RectShape("child", 0, 0, 10, 10);
    outer.addChild(child);
    document.addShape(outer);
    document.addShape(new CircleShape("sibling", 0, 0, 2));

    expectDocumentProtocolError(
      () => document.groupShapes("cluster", []),
      CommandErrorCode.InvalidArgument,
      "group requires at least two members",
    );
    expectDocumentProtocolError(
      () => document.groupShapes("cluster", ["child"]),
      CommandErrorCode.InvalidArgument,
      "group requires at least two members",
    );
    expectDocumentProtocolError(
      () => document.groupShapes("cluster", ["child", "child"]),
      CommandErrorCode.InvalidArgument,
      "duplicate member id: child",
    );
    expectDocumentProtocolError(
      () => document.groupShapes("outer", ["child", "sibling"]),
      CommandErrorCode.DuplicateId,
      "id already exists: outer",
    );
    expectDocumentProtocolError(
      () => document.groupShapes("cluster", ["outer", "child"]),
      CommandErrorCode.InvalidArgument,
      "cannot group a container into its own descendant: outer",
    );
    expect(document.getParentId("child")).toBe("outer");
  });

  it("ungroup 在容器原位置插入子节点并拒绝非法目标", () => {
    const document = new Document();
    const parent = new GroupShape("parent");
    const first = new RectShape("first", 0, 0, 10, 10);
    const second = new CircleShape("second", 0, 0, 2);
    const container = new GroupShape("container", [first, second]);
    const tail = new RectShape("tail", 20, 20, 5, 5);
    parent.addChild(container);
    parent.addChild(tail);
    document.addShape(parent);

    document.ungroupShapes("container");

    expect(document.getChildren("parent")).toEqual([first, second, tail]);
    expect(document.getParentId("first")).toBe("parent");
    expect(document.getParentId("second")).toBe("parent");
    expect(document.findShape("container")).toBeUndefined();

    expectDocumentProtocolError(
      () => document.ungroupShapes("first"),
      CommandErrorCode.NotContainer,
      "not a container: first",
    );

    const topLevel = new GroupShape("top");
    document.addShape(topLevel);
    expectDocumentProtocolError(
      () => document.ungroupShapes("top"),
      CommandErrorCode.InvalidArgument,
      "cannot ungroup top-level container: top",
    );
  });

  it("addto 迁移归属并拒绝自嵌套", () => {
    const document = new Document();
    const source = new RectShape("r1", 0, 0, 10, 10);
    const target = new GroupShape("target");
    document.addShape(source);
    document.addShape(target);

    document.addToContainer("target", "r1");

    expect(document.getRootShapes()).toEqual([target]);
    expect(document.getChildren("target")).toEqual([source]);
    expect(document.getParentId("r1")).toBe("target");

    expectDocumentProtocolError(
      () => document.addToContainer("target", "target"),
      CommandErrorCode.InvalidArgument,
      "cannot add a container into its own descendant: target",
    );

    const nested = new GroupShape("nested");
    document.addShape(nested, "target");
    expectDocumentProtocolError(
      () => document.addToContainer("nested", "target"),
      CommandErrorCode.InvalidArgument,
      "cannot add a container into its own descendant: target",
    );
  });

  it("reorder 调整根级和组内顺序", () => {
    const document = new Document();
    const first = new RectShape("first", 0, 0, 1, 1);
    const second = new RectShape("second", 0, 0, 1, 1);
    const third = new RectShape("third", 0, 0, 1, 1);
    document.addShape(first);
    document.addShape(second);
    document.addShape(third);

    document.reorderShape("third", "front");
    expect(document.getRootShapes()).toEqual([third, first, second]);
    document.reorderShape("third", "back");
    expect(document.getRootShapes()).toEqual([first, second, third]);

    const group = new GroupShape("g1", [first, second, third]);
    document.deleteShape("first");
    document.deleteShape("second");
    document.deleteShape("third");
    document.addShape(group);
    document.reorderShape("third", "front");
    expect(group.getChildren()).toEqual([third, first, second]);
    document.reorderShape("third", "back");
    expect(group.getChildren()).toEqual([first, second, third]);
  });
});
