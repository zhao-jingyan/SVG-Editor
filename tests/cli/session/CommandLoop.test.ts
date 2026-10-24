import { describe, expect, it } from "vitest";
import type { CommandParser } from "../../../src/cli/parser/CommandParser";
import { CommandLoop } from "../../../src/cli/session/CommandLoop";
import { CommandSession } from "../../../src/cli/session/CommandSession";
import type { InputReader } from "../../../src/cli/io/InputReader";
import type { OutputWriter } from "../../../src/cli/io/OutputWriter";
import type { CommandParseResult } from "../../../src/cli/parser/results/CommandParseResult";
import { CommandParseSuccessResult } from "../../../src/cli/parser/results/CommandParseSuccessResult";
import { ExitCommand } from "../../../src/protocol/commands/session/ExitCommand";
import { HelpCommand } from "../../../src/protocol/commands/view/HelpCommand";
import type { Command } from "../../../src/protocol/commands/Command";
import type { Executor } from "../../../src/protocol/execution/Executor";
import { CommandExitResult } from "../../../src/protocol/results/outcomes/CommandExitResult";
import type { CommandResult } from "../../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../../src/protocol/results/outcomes/CommandSuccessResult";

class FakeInputReader implements InputReader {
  public readCount = 0;

  public constructor(private readonly inputs: Array<string | null>) {}

  public async readLine(): Promise<string | null> {
    this.readCount += 1;
    return this.inputs.shift() ?? null;
  }
}

class FakeOutputWriter implements OutputWriter {
  public readonly prompts: string[] = [];
  public readonly lines: string[] = [];

  public async writePrompt(prompt: string): Promise<void> {
    this.prompts.push(prompt);
  }

  public async writeLine(text: string): Promise<void> {
    this.lines.push(text);
  }
}

class FakeCommandParser implements CommandParser {
  public constructor(private readonly results: CommandParseResult[]) {}

  public parse(_line: string): CommandParseResult {
    const result = this.results.shift();

    if (result === undefined) {
      throw new Error("unexpected parse");
    }

    return result;
  }
}

class FakeExecutor implements Executor {
  public constructor(private readonly results: CommandResult[]) {}

  public async execute(_command: Command): Promise<CommandResult> {
    const result = this.results.shift();

    if (result === undefined) {
      throw new Error("unexpected execute");
    }

    return result;
  }
}

function createSession(
  parser: CommandParser,
  executor: Executor,
  output: OutputWriter,
): CommandSession {
  return new CommandSession(parser, executor, output);
}

describe("CommandLoop", () => {
  it("在开始循环前输出可选启动提示", async () => {
    const input = new FakeInputReader([null]);
    const output = new FakeOutputWriter();
    const session = createSession(
      new FakeCommandParser([]),
      new FakeExecutor([]),
      output,
    );

    await new CommandLoop(input, output, session, "svg-editor 1.0.0").run();

    expect(output.lines).toEqual(["svg-editor 1.0.0"]);
    expect(output.prompts).toEqual(["svg> "]);
  });

  it("逐行处理输入并在收到退出状态后停止读取", async () => {
    const input = new FakeInputReader(["help", "exit", "unread"]);
    const output = new FakeOutputWriter();
    const parser = new FakeCommandParser([
      new CommandParseSuccessResult(new HelpCommand()),
      new CommandParseSuccessResult(new ExitCommand()),
    ]);
    const executor = new FakeExecutor([
      new CommandSuccessResult("help text"),
      new CommandExitResult(),
    ]);
    const session = createSession(parser, executor, output);

    await new CommandLoop(input, output, session).run();

    expect(input.readCount).toBe(2);
    expect(output.lines).toEqual(["help text"]);
    expect(output.prompts).toEqual(["svg> ", "svg> "]);
  });
});
