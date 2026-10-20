import { describe, expect, it } from "vitest";
import type { CommandParser } from "../../src/cli/CommandParser";
import type { InputReader } from "../../src/cli/InputReader";
import type { OutputWriter } from "../../src/cli/OutputWriter";
import { Repl } from "../../src/cli/Repl";
import { CommandParseEmptyResult } from "../../src/cli/results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "../../src/cli/results/CommandParseErrorResult";
import type { CommandParseResult } from "../../src/cli/results/CommandParseResult";
import { CommandParseSuccessResult } from "../../src/cli/results/CommandParseSuccessResult";
import type { Command } from "../../src/protocol/Command";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../../src/protocol/errors/CommandExecutionError";
import { CommandParseError } from "../../src/protocol/errors/CommandParseError";
import { CreateCommand } from "../../src/protocol/commands/CreateCommand";
import { ExitCommand } from "../../src/protocol/commands/ExitCommand";
import { HelpCommand } from "../../src/protocol/commands/HelpCommand";
import { MoveCommand } from "../../src/protocol/commands/MoveCommand";
import { CommandErrorResult } from "../../src/protocol/results/CommandErrorResult";
import { CommandExitResult } from "../../src/protocol/results/CommandExitResult";
import type { CommandResult } from "../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../src/protocol/results/CommandSuccessResult";
import type { Executor } from "../../src/protocol/Executor";

class FakeInputReader implements InputReader {
  public constructor(private readonly inputs: Array<string | null>) {}

  public async readLine(): Promise<string | null> {
    return this.inputs.shift() ?? null;
  }
}

class FakeOutputWriter implements OutputWriter {
  public prompts: string[] = [];
  public lines: string[] = [];

  public async writePrompt(prompt: string): Promise<void> {
    this.prompts.push(prompt);
  }

  public async writeLine(text: string): Promise<void> {
    this.lines.push(text);
  }
}

class FakeCommandParser implements CommandParser {
  public inputs: string[] = [];

  public constructor(private readonly results: CommandParseResult[]) {}

  public parse(line: string): CommandParseResult {
    this.inputs.push(line);
    return this.results.shift() ?? new CommandParseEmptyResult();
  }
}

class FakeExecutor implements Executor {
  public commands: Command[] = [];

  public constructor(private readonly results: Array<CommandResult | Error>) {}

  public async execute(command: Command): Promise<CommandResult> {
    this.commands.push(command);
    const result = this.results.shift();

    if (result instanceof Error) {
      throw result;
    }

    return result ?? new CommandExitResult();
  }
}

describe("Repl", () => {
  it("在开始循环前输出可选启动提示", async () => {
    const input = new FakeInputReader([null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([]);
    const executor = new FakeExecutor([]);

    await new Repl(input, output, parser, executor, "svg-editor 0.1").run();

    expect(output.lines).toEqual(["svg-editor 0.1"]);
    expect(output.prompts).toEqual(["svg> "]);
  });

  it("将解析后的 Command 传给 Executor 并输出成功消息", async () => {
    const input = new FakeInputReader(["create rect r1 0 0 10 10", null]);
    const output = new FakeOutputWriter();
    const command = new CreateCommand({
      type: "rect",
      id: "r1",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    const parser = new FakeCommandParser([new CommandParseSuccessResult(command)]);
    const executor = new FakeExecutor([
      new CommandSuccessResult("rect#r1 created"),
    ]);

    await new Repl(input, output, parser, executor).run();

    expect(parser.inputs).toEqual(["create rect r1 0 0 10 10"]);
    expect(executor.commands).toHaveLength(1);
    expect(executor.commands[0]).toBe(command);
    expect(output.lines).toEqual(["rect#r1 created"]);
    expect(output.prompts).toEqual(["svg> ", "svg> "]);
  });

  it("空输入不会调用 Executor", async () => {
    const input = new FakeInputReader(["", "# comment", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      new CommandParseEmptyResult(),
      new CommandParseEmptyResult(),
    ]);
    const executor = new FakeExecutor([]);

    await new Repl(input, output, parser, executor).run();

    expect(executor.commands).toEqual([]);
    expect(output.lines).toEqual([]);
    expect(output.prompts).toEqual(["svg> ", "svg> ", "svg> "]);
  });

  it("输出解析错误并继续循环", async () => {
    const input = new FakeInputReader(["bad", "help", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      new CommandParseErrorResult(
        new CommandParseError(
          CommandErrorCode.InvalidCommand,
          "unknown command: bad",
        ),
      ),
      new CommandParseSuccessResult(new HelpCommand()),
    ]);
    const executor = new FakeExecutor([new CommandSuccessResult("help text")]);

    await new Repl(input, output, parser, executor).run();

    expect(output.lines).toEqual(["error: unknown command: bad", "help text"]);
  });

  it("输出 Executor 返回的错误结果并继续循环", async () => {
    const input = new FakeInputReader(["move r1 1 1", "help", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new MoveCommand("r1", 1, 1)),
      new CommandParseSuccessResult(new HelpCommand()),
    ]);
    const executor = new FakeExecutor([
      new CommandErrorResult(
        new CommandExecutionError(
          CommandErrorCode.ShapeNotFound,
          "no such shape: r1",
        ),
      ),
      new CommandSuccessResult("help text"),
    ]);

    await new Repl(input, output, parser, executor).run();

    expect(output.lines).toEqual(["error: no such shape: r1", "help text"]);
  });

  it("收到 exit 时结束循环", async () => {
    const input = new FakeInputReader(["exit", "unread"]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new ExitCommand()),
    ]);
    const executor = new FakeExecutor([new CommandExitResult()]);

    await new Repl(input, output, parser, executor).run();

    expect(executor.commands).toHaveLength(1);
    expect(executor.commands[0]).toBeInstanceOf(ExitCommand);
    expect(output.lines).toEqual([]);
    expect(output.prompts).toEqual(["svg> "]);
  });

  it("Executor 抛异常时输出错误并继续", async () => {
    const input = new FakeInputReader(["first", "second", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new HelpCommand()),
      new CommandParseSuccessResult(new HelpCommand()),
    ]);
    const executor = new FakeExecutor([
      new Error("temporary failure"),
      new CommandSuccessResult("recovered"),
    ]);

    await new Repl(input, output, parser, executor).run();

    expect(output.lines).toEqual(["error: temporary failure", "recovered"]);
  });
});
