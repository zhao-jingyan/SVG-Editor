import { describe, expect, it } from "vitest";
import { DemoCommandContext } from "../../src/core/DemoCommandContext";
import { DemoExecutor } from "../../src/core/DemoExecutor";
import { CreateCommand } from "../../src/protocol/commands/CreateCommand";
import { ExitCommand } from "../../src/protocol/commands/ExitCommand";
import { InitCommand } from "../../src/protocol/commands/InitCommand";
import { HelpCommand } from "../../src/protocol/commands/HelpCommand";
import { CommandExitResult } from "../../src/protocol/results/CommandExitResult";
import { CommandSuccessResult } from "../../src/protocol/results/CommandSuccessResult";
import { GroupShape } from "../../src/protocol/shapes/GroupShape";

describe("DemoExecutor", () => {
  const executor = new DemoExecutor(new DemoCommandContext());

  it("通过 Command 多态调用 DemoCommandContext", async () => {
    const initResult = await executor.execute(new InitCommand());
    expect(initResult).toBeInstanceOf(CommandSuccessResult);
    expect(initResult.toCommandResultDto()).toEqual({
      type: "success",
      message: "received command: init",
    });

    const createResult = await executor.execute(
      new CreateCommand(new GroupShape("g1")),
    );
    expect(createResult).toBeInstanceOf(CommandSuccessResult);
    expect(createResult.toCommandResultDto()).toEqual({
      type: "success",
      message: "received command: create",
    });

    const helpResult = await executor.execute(new HelpCommand());
    expect(helpResult).toBeInstanceOf(CommandSuccessResult);
    expect(helpResult.toCommandResultDto()).toEqual({
      type: "success",
      message: "received command: help",
    });
  });

  it("ExitCommand 直接返回退出结果", async () => {
    const result = await executor.execute(new ExitCommand());

    expect(result).toBeInstanceOf(CommandExitResult);
    expect(result.toCommandResultDto()).toEqual({ type: "exit" });
  });
});
