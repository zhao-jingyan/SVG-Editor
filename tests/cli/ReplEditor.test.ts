import { describe, expect, it } from "vitest";
import { CommandLineParser } from "../../src/cli/CommandLineParser";
import type { InputReader } from "../../src/cli/InputReader";
import type { OutputWriter } from "../../src/cli/OutputWriter";
import { Repl } from "../../src/cli/Repl";
import { CommandExecutor } from "../../src/core/CommandExecutor";
import { EditorContext } from "../../src/core/EditorContext";
import { ShapeFactory } from "../../src/protocol/shapes/ShapeFactory";

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

describe("Repl 真实编辑链路", () => {
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
    const context = new EditorContext();
    const repl = new Repl(
      input,
      output,
      new CommandLineParser(new ShapeFactory()),
      new CommandExecutor(context),
      "svg-editor 0.1 — type 'help' for commands",
    );

    await repl.run();

    expect(output.lines).toEqual([
      "svg-editor 0.1 — type 'help' for commands",
      "canvas 800x600 created",
      "rect#r1 created",
      "rect#r1 moved by (5,5)",
      "rect#r1 moved back by (-5,-5)",
      "rect#r1 moved by (5,5)",
    ]);
    expect(context.captureAttribute("r1", "x").getValue("r1")).toBe(5);
  });
});
