import { describe, expect, it } from "vitest";
import { ShapeIndex } from "../../../src/core/document/ShapeIndex";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { ErrorSource } from "../../../src/protocol/errors/ErrorSource";
import { ProtocolError } from "../../../src/protocol/errors/ProtocolError";
import { CircleShape } from "../../../src/protocol/shapes/concrete/CircleShape";
import { GroupShape } from "../../../src/protocol/shapes/concrete/GroupShape";
import { RectShape } from "../../../src/protocol/shapes/concrete/RectShape";

function expectIndexError(
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

describe("ShapeIndex", () => {
  it("注册嵌套子树并维护全局索引和祖先关系", () => {
    const index = new ShapeIndex();
    const leaf = new CircleShape("leaf", 0, 0, 2);
    const inner = new GroupShape("inner", [leaf]);
    const root = new GroupShape("root", [inner]);

    index.registerSubtree(root, undefined);

    expect(index.findShape("root")).toBe(root);
    expect(index.findShape("inner")).toBe(inner);
    expect(index.findShape("leaf")).toBe(leaf);
    expect(index.getParent("root")).toBeUndefined();
    expect(index.getParent("inner")).toBe(root);
    expect(index.getParent("leaf")).toBe(inner);
    expect(index.isAncestor("root", "leaf")).toBe(true);
    expect(index.isAncestor("inner", "leaf")).toBe(true);
    expect(index.isAncestor("leaf", "root")).toBe(false);
    expect(index.isAncestor("root", "root")).toBe(false);
  });

  it("拒绝已被全局索引占用的 id", () => {
    const index = new ShapeIndex();
    const rect = new RectShape("duplicate", 0, 0, 1, 1);
    index.registerSubtree(rect, undefined);

    expectIndexError(
      () => index.registerSubtree(
        new CircleShape("duplicate", 0, 0, 2),
        undefined,
      ),
      CommandErrorCode.DuplicateId,
      "id already exists: duplicate",
    );
    expect(index.findShape("duplicate")).toBe(rect);
  });

  it("拒绝子树内部的重复 id 且不产生部分索引", () => {
    const index = new ShapeIndex();
    const duplicateGroup = new GroupShape("outer", [
      new GroupShape("left", [new RectShape("duplicate", 0, 0, 1, 1)]),
      new GroupShape("right", [new RectShape("duplicate", 1, 1, 1, 1)]),
    ]);

    expectIndexError(
      () => index.registerSubtree(duplicateGroup, undefined),
      CommandErrorCode.DuplicateId,
      "id already exists: duplicate",
    );
    expect(index.findShape("outer")).toBeUndefined();
    expect(index.findShape("left")).toBeUndefined();
    expect(index.findShape("right")).toBeUndefined();
  });

  it("注销叶子和容器子树时清理全部索引", () => {
    const index = new ShapeIndex();
    const leaf = new RectShape("leaf", 0, 0, 1, 1);
    const inner = new GroupShape("inner", [leaf]);
    const root = new GroupShape("root", [new CircleShape("sibling", 0, 0, 2), inner]);
    index.registerSubtree(root, undefined);

    index.unregisterSubtree(leaf);
    expect(index.findShape("leaf")).toBeUndefined();
    expect(index.findShape("root")).toBe(root);

    index.unregisterSubtree(root);
    expect(index.findShape("root")).toBeUndefined();
    expect(index.findShape("sibling")).toBeUndefined();
    expect(index.findShape("inner")).toBeUndefined();
  });

  it("注销单个容器时保留其子节点索引", () => {
    const index = new ShapeIndex();
    const leaf = new RectShape("leaf", 0, 0, 1, 1);
    const container = new GroupShape("container", [leaf]);
    index.registerSubtree(container, undefined);

    index.unregisterShape("container");

    expect(index.findShape("container")).toBeUndefined();
    expect(index.findShape("leaf")).toBe(leaf);
    expect(index.getParent("leaf")).toBe(container);
  });

  it("重绑定父节点后更新多级祖先关系", () => {
    const index = new ShapeIndex();
    const leaf = new RectShape("leaf", 0, 0, 1, 1);
    const source = new GroupShape("source", [leaf]);
    const target = new GroupShape("target");
    index.registerSubtree(source, undefined);
    index.registerSubtree(target, undefined);

    index.reparentShape(source, target);

    expect(index.getParent("source")).toBe(target);
    expect(index.isAncestor("target", "leaf")).toBe(true);
    expect(index.isAncestor("source", "leaf")).toBe(true);
  });
});
