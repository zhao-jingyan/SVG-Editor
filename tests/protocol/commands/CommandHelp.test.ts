import { describe, expect, it } from "vitest";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";

describe("CommandHelp", () => {
  it("校验 usage 与描述非空", () => {
    expect(() => new CommandHelp("", "move a shape")).toThrow(
      "command help usage must not be empty",
    );
    expect(() => new CommandHelp("move <id> <dx> <dy>", "  ")).toThrow(
      "command help description must not be empty",
    );
  });

  it("暴露 usage 与描述", () => {
    const help = new CommandHelp("move <id> <dx> <dy>", "move a shape");

    expect(help.getUsage()).toBe("move <id> <dx> <dy>");
    expect(help.getDescription()).toBe("move a shape");
  });
});
