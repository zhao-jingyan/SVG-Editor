import { createInterface, type Interface } from "node:readline";
import type { InputReader } from "./InputReader";

export class ConsoleInputReader implements InputReader {
  private readonly lines: Interface;
  private pendingRead: Promise<string | null> | null = null;

  public constructor() {
    this.lines = createInterface({
      input: process.stdin,
      crlfDelay: Infinity,
    });
  }

  public readLine(): Promise<string | null> {
    if (this.pendingRead !== null) {
      return this.pendingRead;
    }

    this.pendingRead = new Promise((resolve) => {
      const onLine = (line: string): void => {
        cleanup();
        resolve(line);
      };
      const onClose = (): void => {
        cleanup();
        resolve(null);
      };
      const cleanup = (): void => {
        this.lines.removeListener("line", onLine);
        this.lines.removeListener("close", onClose);
        this.pendingRead = null;
      };

      this.lines.once("line", onLine);
      this.lines.once("close", onClose);
    });

    return this.pendingRead;
  }

  public close(): void {
    this.lines.close();
  }
}
