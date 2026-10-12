import { describe, expect, it } from "vitest";
import { Repl } from "../../src/cli/Repl";
import type { InputReader } from "../../src/cli/InputReader";
import type { OutputWriter } from "../../src/cli/OutputWriter";
import type { ExecutionResult } from "../../src/core/ExecutionResult";
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

class FakeExecutor implements Executor {
  public inputs: string[] = [];

  public constructor(
    private readonly results: Array<ExecutionResult | Error>,
  ) {}

  public async execute(input: string): Promise<ExecutionResult> {
    this.inputs.push(input);
    const result = this.results.shift();
    if (result instanceof Error) {
      throw result;
    }
    return result ?? { type: "exit" };
  }
}

describe("Repl", () => {
  it("原样传递输入并输出 Executor 的结果", async () => {
    const input = new FakeInputReader(["  create rect  ", null]);
    const output = new FakeOutputWriter();
    const executor = new FakeExecutor([{ type: "output", text: "ok" }]);

    await new Repl(input, output, executor).run();

    expect(executor.inputs).toEqual(["  create rect  "]);
    expect(output.lines).toEqual(["ok"]);
    expect(output.prompts).toEqual(["svg> ", "svg> "]);
  });

  it("输出错误结果并继续循环", async () => {
    const input = new FakeInputReader(["bad", "good", null]);
    const output = new FakeOutputWriter();
    const executor = new FakeExecutor([
      { type: "error", text: "invalid input" },
      { type: "output", text: "accepted" },
    ]);

    await new Repl(input, output, executor).run();

    expect(output.lines).toEqual(["invalid input", "accepted"]);
  });

  it("收到 exit 时结束循环", async () => {
    const input = new FakeInputReader(["exit", "unread"]);
    const output = new FakeOutputWriter();
    const executor = new FakeExecutor([{ type: "exit" }]);

    await new Repl(input, output, executor).run();

    expect(executor.inputs).toEqual(["exit"]);
    expect(output.lines).toEqual([]);
    expect(output.prompts).toEqual(["svg> "]);
  });

  it("空输入不会崩溃", async () => {
    const input = new FakeInputReader(["", "   ", null]);
    const output = new FakeOutputWriter();
    const executor = new FakeExecutor([
      { type: "output", text: "" },
      { type: "output", text: "" },
    ]);

    await expect(new Repl(input, output, executor).run()).resolves.toBeUndefined();
    expect(executor.inputs).toEqual(["", "   "]);
    expect(output.lines).toEqual(["", ""]);
  });

  it("Executor 抛异常时输出错误并继续", async () => {
    const input = new FakeInputReader(["first", "second", null]);
    const output = new FakeOutputWriter();
    const executor = new FakeExecutor([
      new Error("temporary failure"),
      { type: "output", text: "recovered" },
    ]);

    await new Repl(input, output, executor).run();

    expect(output.lines).toEqual(["error: temporary failure", "recovered"]);
  });
});
