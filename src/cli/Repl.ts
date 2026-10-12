import type { InputReader } from "./InputReader";
import type { OutputWriter } from "./OutputWriter";
import type { Executor } from "../core/Executor";

export class Repl {
  private static readonly prompt = "svg> ";

  public constructor(
    private readonly inputReader: InputReader,
    private readonly outputWriter: OutputWriter,
    private readonly executor: Executor,
  ) {}

  public async run(): Promise<void> {
    while (true) {
      await this.outputWriter.writePrompt(Repl.prompt);
      const input = await this.inputReader.readLine();

      if (input === null) {
        return;
      }

      try {
        const result = await this.executor.execute(input);

        if (result.type === "exit") {
          return;
        }

        await this.outputWriter.writeLine(result.text);
      } catch (error: unknown) {
        await this.outputWriter.writeLine(Repl.errorMessage(error));
      }
    }
  }

  private static errorMessage(error: unknown): string {
    if (error instanceof Error && error.message.length > 0) {
      return `error: ${error.message}`;
    }

    return "error: executor failed";
  }
}
