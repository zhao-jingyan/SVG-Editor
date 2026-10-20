import { createInterface, type Interface } from "node:readline";
import type { InputReader } from "./InputReader";

export class ConsoleInputReader implements InputReader {
  private readonly lines: Interface;
  private readonly queuedLines: string[] = [];
  private pendingRead: Promise<string | null> | null = null;
  private resolvePendingRead: ((line: string | null) => void) | null = null;
  private closed = false;

  public constructor() {
    this.lines = createInterface({
      input: process.stdin,
      crlfDelay: Infinity,
    });

    this.lines.on("line", (line: string) => {
      if (this.resolvePendingRead !== null) {
        const resolve = this.resolvePendingRead;
        this.resolvePendingRead = null;
        this.pendingRead = null;
        resolve(line);
        return;
      }

      this.queuedLines.push(line);
    });

    this.lines.on("close", () => {
      this.closed = true;

      if (this.resolvePendingRead !== null) {
        const resolve = this.resolvePendingRead;
        this.resolvePendingRead = null;
        this.pendingRead = null;
        resolve(null);
      }
    });
  }

  public readLine(): Promise<string | null> {
    const queuedLine = this.queuedLines.shift();

    if (queuedLine !== undefined) {
      return Promise.resolve(queuedLine);
    }

    if (this.closed) {
      return Promise.resolve(null);
    }

    if (this.pendingRead !== null) {
      return this.pendingRead;
    }

    this.pendingRead = new Promise((resolve) => {
      this.resolvePendingRead = resolve;
    });

    return this.pendingRead;
  }

  public close(): void {
    this.lines.close();
  }
}
