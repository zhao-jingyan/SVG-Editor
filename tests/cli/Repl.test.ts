import { describe, expect, it } from "vitest";
import type { CommandParser } from "../../src/cli/CommandParser";
import type { CommandParseResult } from "../../src/cli/CommandParseResult";
import type { InputReader } from "../../src/cli/InputReader";
import type { OutputWriter } from "../../src/cli/OutputWriter";
import { Repl } from "../../src/cli/Repl";
import type { Command } from "../../src/protocol/Command";
import type { CommandResult } from "../../src/protocol/CommandResult";
import type { Executor } from "../../src/core/Executor";

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
    return this.results.shift() ?? { type: "empty" };
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

    return result ?? { type: "exit" };
  }
}

describe("Repl", () => {
  it("将解析后的 Command 传给 Executor 并输出成功消息", async () => {
    const input = new FakeInputReader(["create rect r1 0 0 10 10", null]);
    const output = new FakeOutputWriter();
    const command: Command = {
      type: "create",
      shape: { type: "rect", id: "r1", x: 0, y: 0, width: 10, height: 10 },
    };
    const parser = new FakeCommandParser([{ type: "command", command }]);
    const executor = new FakeExecutor([
      { type: "success", message: "rect#r1 created" },
    ]);

    await new Repl(input, output, parser, executor).run();

    expect(parser.inputs).toEqual(["create rect r1 0 0 10 10"]);
    expect(executor.commands).toEqual([command]);
    expect(output.lines).toEqual(["rect#r1 created"]);
    expect(output.prompts).toEqual(["svg> ", "svg> "]);
  });

  it("空输入不会调用 Executor", async () => {
    const input = new FakeInputReader(["", "# comment", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      { type: "empty" },
      { type: "empty" },
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
      {
        type: "error",
        error: { code: "invalid-command", message: "unknown command: bad" },
      },
      { type: "command", command: { type: "help" } },
    ]);
    const executor = new FakeExecutor([{ type: "success", message: "help text" }]);

    await new Repl(input, output, parser, executor).run();

    expect(output.lines).toEqual(["error: unknown command: bad", "help text"]);
  });

  it("输出 Executor 返回的错误结果并继续循环", async () => {
    const input = new FakeInputReader(["move r1 1 1", "help", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      {
        type: "command",
        command: { type: "move", shapeId: "r1", dx: 1, dy: 1 },
      },
      { type: "command", command: { type: "help" } },
    ]);
    const executor = new FakeExecutor([
      {
        type: "error",
        error: { code: "shape-not-found", message: "no such shape: r1" },
      },
      { type: "success", message: "help text" },
    ]);

    await new Repl(input, output, parser, executor).run();

    expect(output.lines).toEqual(["error: no such shape: r1", "help text"]);
  });

  it("收到 exit 时结束循环", async () => {
    const input = new FakeInputReader(["exit", "unread"]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      { type: "command", command: { type: "exit" } },
    ]);
    const executor = new FakeExecutor([{ type: "exit" }]);

    await new Repl(input, output, parser, executor).run();

    expect(executor.commands).toEqual([{ type: "exit" }]);
    expect(output.lines).toEqual([]);
    expect(output.prompts).toEqual(["svg> "]);
  });

  it("Executor 抛异常时输出错误并继续", async () => {
    const input = new FakeInputReader(["first", "second", null]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      { type: "command", command: { type: "help" } },
      { type: "command", command: { type: "help" } },
    ]);
    const executor = new FakeExecutor([
      new Error("temporary failure"),
      { type: "success", message: "recovered" },
    ]);

    await new Repl(input, output, parser, executor).run();

    expect(output.lines).toEqual(["error: temporary failure", "recovered"]);
  });
});
