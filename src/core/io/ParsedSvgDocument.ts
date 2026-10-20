import type { Document } from "../document/Document";

export class ParsedSvgDocument {
  public constructor(
    private readonly document: Document,
    private readonly warnings: readonly string[],
    private readonly elementCount: number,
  ) {}

  public getDocument(): Document {
    return this.document;
  }

  public getWarnings(): readonly string[] {
    return [...this.warnings];
  }

  public getElementCount(): number {
    return this.elementCount;
  }
}
