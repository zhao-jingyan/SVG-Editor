import { describe, expect, it } from "vitest";
import type { CommandParser } from "../../../src/cli/parser/CommandParser";
import { CommandSession } from "../../../src/cli/session/CommandSession";
import { CommandSessionStatus } from "../../../src/cli/session/CommandSessionStatus";
import type { OutputWriter } from "../../../src/cli/io/OutputWriter";
import { CommandParseEmptyResult } from "../../../src/cli/parser/results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "../../../src/cli/parser/results/CommandParseErrorResult";
import type { CommandParseResult } from "../../../src/cli/parser/results/CommandParseResult";
import { CommandParseSuccessResult } from "../../../src/cli/parser/results/CommandParseSuccessResult";
import type { Command } from "../../../src/protocol/Command";
import { ExitCommand } from "../../../src/protocol/commands/ExitCommand";
import { HelpCommand } from "../../../src/protocol/commands/HelpCommand";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../../../src/protocol/errors/CommandExecutionError";
import { CommandParseError } from "../../../src/protocol/errors/CommandParseError";
import type { Executor } from "../../../src/protocol/Executor";
import { CommandErrorResult } from "../../../src/protocol/results/CommandErrorResult";
import { CommandExitResult } from "../../../src/protocol/results/CommandExitResult";
import type { CommandResult } from "../../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../../src/protocol/results/CommandSuccessResult";

class FakeOutputWriter implements OutputWriter {
  public readonly lines: string[] = [];

  public async writePrompt(_prompt: string): Promise<void> {}

  public async writeLine(text: string): Promise<void> {
    this.lines.push(text);
  }
}

class FakeCommandParser implements CommandParser {
  public readonly inputs: string[] = [];

  public constructor(private readonly results: CommandParseResult[]) {}

  public parse(line: string): CommandParseResult {
    this.inputs.push(line);
    const result = this.results.shift();

    if (result === undefined) {
      throw new Error("unexpected parse");
    }

    return result;
  }
}

class FakeExecutor implements Executor {
  public readonly commands: Command[] = [];

  public constructor(private readonly results: Array<CommandResult | Error>) {}

  public async execute(command: Command): Promise<CommandResult> {
    this.commands.push(command);
    const result = this.results.shift();

    if (result === undefined) {
      throw new Error("unexpected execute");
    }

    if (result instanceof Error) {
      throw result;
    }

    return result;
  }
}

describe("CommandSession", () => {
  it("空输入不执行命令且继续会话", async () => {
    const parser = new FakeCommandParser([new CommandParseEmptyResult()]);
    const executor = new FakeExecutor([]);
    const output = new FakeOutputWriter();
    const session = new CommandSession(parser, executor, output);

    const status = await session.handle("   ");

    expect(status).toBe(CommandSessionStatus.Continue);
    expect(executor.commands).toEqual([]);
    expect(output.lines).toEqual([]);
  });

  it("输出解析错误并继续会话", async () => {
    const parser = new FakeCommandParser([
      new CommandParseErrorResult(
        new CommandParseError(
          CommandErrorCode.InvalidCommand,
          "unknown command: bad",
        ),
      ),
    ]);
    const executor = new FakeExecutor([]);
    const output = new FakeOutputWriter();
    const session = new CommandSession(parser, executor, output);

    const status = await session.handle("bad");

    expect(status).toBe(CommandSessionStatus.Continue);
    expect(executor.commands).toEqual([]);
    expect(output.lines).toEqual(["error: unknown command: bad"]);
  });

  it("执行解析出的命令并输出成功消息", async () => {
    const command = new HelpCommand();
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(command),
    ]);
    const executor = new FakeExecutor([
      new CommandSuccessResult("help text"),
    ]);
    const output = new FakeOutputWriter();
    const session = new CommandSession(parser, executor, output);

    const status = await session.handle("help");

    expect(status).toBe(CommandSessionStatus.Continue);
    expect(parser.inputs).toEqual(["help"]);
    expect(executor.commands).toEqual([command]);
    expect(output.lines).toEqual(["help text"]);
  });

  it("输出执行错误结果并继续会话", async () => {
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new HelpCommand()),
    ]);
    const executor = new FakeExecutor([
      new CommandErrorResult(
        new CommandExecutionError(
          CommandErrorCode.ShapeNotFound,
          "no such shape: missing",
        ),
      ),
    ]);
    const output = new FakeOutputWriter();
    const session = new CommandSession(parser, executor, output);

    const status = await session.handle("show missing");

    expect(status).toBe(CommandSessionStatus.Continue);
    expect(output.lines).toEqual(["error: no such shape: missing"]);
  });

  it("收到退出结果时结束会话", async () => {
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new ExitCommand()),
    ]);
    const executor = new FakeExecutor([new CommandExitResult()]);
    const output = new FakeOutputWriter();
    const session = new CommandSession(parser, executor, output);

    const status = await session.handle("exit");

    expect(status).toBe(CommandSessionStatus.Exit);
    expect(output.lines).toEqual([]);
  });

  it("让未知异常继续向上抛出", async () => {
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new HelpCommand()),
    ]);
    const executor = new FakeExecutor([new Error("programming failure")]);
    const output = new FakeOutputWriter();
    const session = new CommandSession(parser, executor, output);

    await expect(session.handle("help")).rejects.toThrow("programming failure");
    expect(output.lines).toEqual([]);
  });
});
