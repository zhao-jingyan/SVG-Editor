import { describe, expect, it } from "vitest";
import { CommandDefinitionRegistry } from "../../../../../src/cli/parser/commands/definition/CommandDefinitionRegistry";
import { HelpCommand } from "../../../../../src/protocol/commands/view/HelpCommand";
import { CommandRegistration } from "../../../../../src/protocol/plugins/CommandRegistration";

function createRegistration(name: string): CommandRegistration {
  return new CommandRegistration(
    name,
    name,
    undefined,
    () => new HelpCommand(),
  );
}

describe("CommandDefinitionRegistry", () => {
  it("保持注册顺序并支持查找", () => {
    const registry = new CommandDefinitionRegistry();
    const first = createRegistration("first");
    const second = createRegistration("second");

    registry.register(first);
    registry.register(second);

    expect(registry.find("first")).toBe(first);
    expect(registry.find("missing")).toBeUndefined();
    expect(registry.getRegistrations()).toEqual([first, second]);
  });

  it("拒绝同名命令", () => {
    const registry = new CommandDefinitionRegistry();
    registry.register(createRegistration("duplicate"));

    expect(() => registry.register(createRegistration("duplicate"))).toThrow(
      "duplicate registration: commands/duplicate",
    );
  });
});
