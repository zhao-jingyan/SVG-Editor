import type { InputReader } from "./InputReader";
import type { OutputWriter } from "./OutputWriter";
import type { CommandParser } from "./CommandParser";
import type { Executor } from "../core/Executor";

export class Repl {
  private static readonly prompt = "svg> ";

  public constructor(
    private readonly inputReader: InputReader,
    private readonly outputWriter: OutputWriter,
    private readonly commandParser: CommandParser,
    private readonly executor: Executor,
  ) {}

  public async run(): Promise<void> {
    while (true) {
      await this.outputWriter.writePrompt(Repl.prompt);
      const input = await this.inputReader.readLine();

      if (input === null) {
        return;
      }

      const parseResult = this.commandParser.parse(input);

      if (parseResult.type === "empty") {
        continue;
      }

      if (parseResult.type === "error") {
        await this.outputWriter.writeLine(`error: ${parseResult.error.message}`);
        continue;
      }

      try {
        const result = await this.executor.execute(parseResult.command);

        if (result.type === "exit") {
          return;
        }

        if (result.type === "success") {
          await this.outputWriter.writeLine(result.message);
        } else {
          await this.outputWriter.writeLine(`error: ${result.error.message}`);
        }
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
