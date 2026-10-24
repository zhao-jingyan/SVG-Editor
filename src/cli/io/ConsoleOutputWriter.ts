import type { OutputWriter } from "./OutputWriter";

export class ConsoleOutputWriter implements OutputWriter {
  public async writePrompt(prompt: string): Promise<void> {
    process.stdout.write(prompt);
  }

  public async writeLine(text: string): Promise<void> {
    process.stdout.write(`${text}\n`);
  }
}
