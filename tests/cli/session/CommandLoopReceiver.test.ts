import { describe, expect, it } from "vitest";
import { CommandLineParser } from "@/cli/parser/CommandLineParser";
import { CommandLoop } from "@/cli/session/CommandLoop";
import { CommandSession } from "@/cli/session/CommandSession";
import type { InputReader } from "@/cli/io/InputReader";
import type { OutputWriter } from "@/cli/io/OutputWriter";
import { CommandExecutor } from "@/core/CommandExecutor";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { CommandHistory } from "@/core/history/CommandHistory";
import { createBuiltinCatalog } from "../../support/createBuiltinCatalog";

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
    const receiver = new EditorCommandReceiver(history);
    const session = new CommandSession(
      new CommandLineParser(createBuiltinCatalog()),
      new CommandExecutor(receiver, history),
      output,
    );
    const commandLoop = new CommandLoop(
      input,
      output,
      session,
      "svg-editor 1.0.0 — type 'help' for commands",
    );

    await commandLoop.run();

    expect(output.lines).toEqual([
      "svg-editor 1.0.0 — type 'help' for commands",
      "canvas 800x600 created",
      "rect#r1 created",
      "rect#r1 moved to (5,5)",
      "rect#r1 moved back to (0,0)",
      "rect#r1 moved to (5,5)",
    ]);
    expect(receiver.captureAttribute("r1", "x").getValue("r1")).toBe(5);
  });
});
