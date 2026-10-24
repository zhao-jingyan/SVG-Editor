import { describe, expect, it } from "vitest";
import { CommandLineParser } from "../../../src/cli/parser/CommandLineParser";
import { CommandLoop } from "../../../src/cli/session/CommandLoop";
import { CommandSession } from "../../../src/cli/session/CommandSession";
import type { InputReader } from "../../../src/cli/io/InputReader";
import type { OutputWriter } from "../../../src/cli/io/OutputWriter";
import { CommandExecutor } from "../../../src/core/CommandExecutor";
import { EditorReceiver } from "../../../src/core/receiver/EditorReceiver";
import { CommandHistory } from "../../../src/core/history/CommandHistory";
import { ShapeFactory } from "../../../src/protocol/shapes/factory/ShapeFactory";

class FakeInputReader implements InputReader {
  public constructor(private readonly inputs: Array<string | null>) {}

  public async readLine(): Promise<string | null> {
    return this.inputs.shift() ?? null;
  }
}

class FakeOutputWriter implements OutputWriter {
  public readonly lines: string[] = [];

  public async writePrompt(_prompt: string): Promise<void> {}

  public async writeLine(text: string): Promise<void> {
    this.lines.push(text);
  }
}

describe("CommandLoop 真实编辑链路", () => {
  it("完成 init、create、move、undo、redo 和 exit", async () => {
    const input = new FakeInputReader([
      "init 800 600",
      "create rect r1 0 0 10 10",
      "move r1 5 5",
      "undo",
      "redo",
      "exit",
    ]);
    const output = new FakeOutputWriter();
    const history = new CommandHistory();
    const receiver = new EditorReceiver(history);
    const session = new CommandSession(
      new CommandLineParser(new ShapeFactory()),
      new CommandExecutor(receiver, history),
      output,
    );
    const commandLoop = new CommandLoop(
      input,
      output,
      session,
      "svg-editor 0.1 — type 'help' for commands",
    );

    await commandLoop.run();

    expect(output.lines).toEqual([
      "svg-editor 0.1 — type 'help' for commands",
      "canvas 800x600 created",
      "rect#r1 created",
      "rect#r1 moved to (5,5)",
      "rect#r1 moved back to (0,0)",
      "rect#r1 moved to (5,5)",
    ]);
    expect(receiver.captureAttribute("r1", "x").getValue("r1")).toBe(5);
  });
});
