import { describe, expect, it } from "vitest";
import { DocumentShapeStats } from "@/_plugin/commands/StatsCommand/DocumentShapeStats";
import { CircleShape } from "@/protocol/shapes/concrete/CircleShape";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";

describe("DocumentShapeStats", () => {
  it("空画布输出 total/containers 为 0", () => {
    expect(DocumentShapeStats.fromRootShapes([]).format()).toBe(
      "(total 0, containers 0)",
    );
  });

  it("按首次出现顺序统计叶子，容器单独计数", () => {
    const roots = [
      new RectShape("r1", 0, 0, 10, 10),
      new GroupShape("g1", [
        new CircleShape("c1", 1, 2, 3),
        new TextShape("t1", 4, 5, "hi"),
        new RectShape("r2", 0, 0, 1, 1),
      ]),
      new CircleShape("c2", 0, 0, 1),
    ];

    expect(DocumentShapeStats.fromRootShapes(roots).format()).toBe(
      "rect: 2  circle: 2  text: 1  (total 5, containers 1)",
    );
  });
});
