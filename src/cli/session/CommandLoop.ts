import type { InputReader } from "../io/InputReader";
import type { OutputWriter } from "../io/OutputWriter";
import { CommandSession } from "./CommandSession";
import { CommandSessionStatus } from "./CommandSessionStatus";

/**
 * CLI 的交互控制循环，只负责提示、读取和终止。
 */
export class CommandLoop {
  private static readonly prompt = "svg> ";

  public constructor(
    private readonly inputReader: InputReader,
    private readonly outputWriter: OutputWriter,
    private readonly session: CommandSession,
    private readonly startupMessage?: string,
  ) {}

  public async run(): Promise<void> {
    if (this.startupMessage !== undefined && this.startupMessage.length > 0) {
      await this.outputWriter.writeLine(this.startupMessage);
    }

    while (true) {
      await this.outputWriter.writePrompt(CommandLoop.prompt);
      const input = await this.inputReader.readLine();

      if (input === null) {
        return;
      }

      if (
        (await this.session.handle(input)) === CommandSessionStatus.Exit
      ) {
        return;
      }
    }
  }
}
