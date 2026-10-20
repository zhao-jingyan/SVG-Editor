import type { SvgStorage } from "../../src/core/io/SvgStorage";

export class InMemorySvgStorage implements SvgStorage {
  public readonly files: Map<string, string> = new Map<string, string>();
  public readError?: Error;
  public writeError?: Error;

  public async read(path: string): Promise<string> {
    if (this.readError !== undefined) {
      throw this.readError;
    }

    const content = this.files.get(path);

    if (content === undefined) {
      throw new Error(`file not found: ${path}`);
    }

    return content;
  }

  public async write(path: string, content: string): Promise<void> {
    if (this.writeError !== undefined) {
      throw this.writeError;
    }

    this.files.set(path, content);
  }
}
