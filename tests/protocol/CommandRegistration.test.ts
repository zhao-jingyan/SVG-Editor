import { describe, expect, it } from "vitest";
import { HelpCommand } from "../../src/protocol/commands/view/HelpCommand";
import { CommandHelp } from "../../src/protocol/plugins/CommandHelp";
import { CommandRegistration } from "../../src/protocol/plugins/CommandRegistration";

describe("CommandRegistration", () => {
  it("封装命令名、解析行为和可选 help", () => {
    const help = new CommandHelp(
      "help",
      "show this help",
    );
    const registration = new CommandRegistration(
      "help",
      "help",
      help,
      () => new HelpCommand(),
    );

    expect(registration.getName()).toBe("help");
    expect(registration.getUsage()).toBe("help");
    expect(registration.getHelp()).toBe(help);
    expect(registration.parse([])).toBeInstanceOf(HelpCommand);
  });

  it("拒绝空命令名和空 usage", () => {
    expect(
      () =>
        new CommandRegistration(
          "",
          "help",
          undefined,
          () => new HelpCommand(),
        ),
    ).toThrow("command registration requires name and usage");
    expect(
      () =>
        new CommandRegistration(
          "help",
          "",
          undefined,
          () => new HelpCommand(),
        ),
    ).toThrow("command registration requires name and usage");
  });

  it("拒绝不完整的 help 描述", () => {
    expect(() => new CommandHelp("", "show help")).toThrow(
      "command help requires usage and description",
    );
    expect(() => new CommandHelp("help", "")).toThrow(
      "command help requires usage and description",
    );
  });
});
