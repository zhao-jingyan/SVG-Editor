import { describe, expect, it } from "vitest";
import { DemoCommandContext } from "../../src/core/DemoCommandContext";
import { DemoExecutor } from "../../src/core/DemoExecutor";
import { CreateCommand } from "../../src/protocol/commands/CreateCommand";
import { ExitCommand } from "../../src/protocol/commands/ExitCommand";
import { InitCommand } from "../../src/protocol/commands/InitCommand";
import { HelpCommand } from "../../src/protocol/commands/HelpCommand";

describe("DemoExecutor", () => {
  const executor = new DemoExecutor(new DemoCommandContext());

  it("通过 Command 多态调用 DemoCommandContext", async () => {
    await expect(executor.execute(new InitCommand())).resolves.toEqual({
      type: "success",
      message: "received command: init",
    });
    await expect(
      executor.execute(new CreateCommand({ type: "g", id: "g1" })),
    ).resolves.toEqual({
      type: "success",
      message: "received command: create",
    });
    await expect(executor.execute(new HelpCommand())).resolves.toEqual({
      type: "success",
      message: "received command: help",
    });
  });

  it("ExitCommand 直接返回退出结果", async () => {
    await expect(executor.execute(new ExitCommand())).resolves.toEqual({
      type: "exit",
    });
  });
});
