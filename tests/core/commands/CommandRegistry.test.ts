import { describe, expect, it } from "vitest";
import { BuiltinCommandContributions } from "../../../src/core/commands/BuiltinCommandContributions";
import { CommandRegistry } from "../../../src/core/commands/CommandRegistry";
import { CommandContribution } from "../../../src/protocol/contribution/CommandContribution";
import { HelpCommand } from "../../../src/protocol/commands/view/HelpCommand";
import { ShapeFactory } from "../../../src/protocol/shapes/factory/ShapeFactory";

describe("CommandRegistry", () => {
  it("按注册顺序查找并枚举贡献", () => {
    const registry = new CommandRegistry();
    registry.registerAll(
      new BuiltinCommandContributions(new ShapeFactory()).create(),
    );

    expect(registry.find("move")?.getName()).toBe("move");
    expect(registry.find("missing")).toBeUndefined();
    expect(
      registry.getContributions().map((contribution) => contribution.getName()),
    ).toEqual([
      "init",
      "read",
      "save",
      "canvas",
      "create",
      "delete",
      "move",
      "scale",
      "set",
      "group",
      "ungroup",
      "addto",
      "front",
      "back",
      "tree",
      "show",
      "undo",
      "redo",
      "help",
      "exit",
    ]);
  });

  it("拒绝同名命令", () => {
    const registry = new CommandRegistry();
    const contribution = new CommandContribution(
      "help",
      "help",
      undefined,
      () => new HelpCommand(),
    );

    registry.register(contribution);
    expect(() => registry.register(contribution)).toThrow(
      "duplicate command: help",
    );
  });
});
