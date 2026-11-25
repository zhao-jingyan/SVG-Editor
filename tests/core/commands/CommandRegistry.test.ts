import { describe, expect, it } from "vitest";
import { CommandRegistry } from "../../../src/core/commands/CommandRegistry";
import { CommandContribution } from "../../../src/protocol/commands/_common/contribution/CommandContribution";
import { HelpCommand } from "../../../src/builtin/commands/HelpCommand/HelpCommand";
import { createBuiltinCatalog } from "../../support/createBuiltinCatalog";

describe("CommandRegistry", () => {
  it("按注册顺序查找并枚举贡献", () => {
    const registry = createBuiltinCatalog();

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
