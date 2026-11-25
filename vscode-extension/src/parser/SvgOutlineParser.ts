import { SvgDocumentNode } from "../model/SvgDocumentNode";
import { SvgElementNode } from "../model/SvgElementNode";
import { SvgOffsetRange } from "../model/SvgOffsetRange";

interface OpeningTag {
  readonly tagName: string;
  readonly id: string | undefined;
  readonly end: number;
  readonly isSelfClosing: boolean;
}

interface ClosingTag {
  readonly tagName: string;
  readonly end: number;
}

interface ParsedElement {
  readonly node: SvgElementNode;
  readonly end: number;
}

export class SvgOutlineParser {
  private source = "";
  private offset = 0;

  public parse(source: string): SvgDocumentNode | undefined {
    this.source = source;
    this.offset = 0;
    this.skipDocumentProlog();

    if (this.offset >= this.source.length || this.source[this.offset] !== "<") {
      return undefined;
    }

    const root = this.parseElement();

    if (root === undefined) {
      return undefined;
    }

    this.offset = root.end;
    this.skipDocumentProlog();

    if (this.offset !== this.source.length) {
      return undefined;
    }

    return new SvgDocumentNode(root.node);
  }

  private parseElement(): ParsedElement | undefined {
    const elementStart = this.offset;
    const openingTag = this.readOpeningTag();

    if (openingTag === undefined) {
      return undefined;
    }

    if (openingTag.isSelfClosing) {
      return {
        node: new SvgElementNode(
          openingTag.tagName,
          openingTag.id,
          new SvgOffsetRange(elementStart, openingTag.end),
          new SvgOffsetRange(elementStart, openingTag.end),
        ),
        end: openingTag.end,
      };
    }

    const children: SvgElementNode[] = [];
    this.offset = openingTag.end;

    while (true) {
      this.skipElementContent();

      if (this.offset >= this.source.length) {
        return undefined;
      }

      if (this.source.startsWith("</", this.offset)) {
        const closingTag = this.readClosingTag();

        if (
          closingTag === undefined ||
          closingTag.tagName !== openingTag.tagName
        ) {
          return undefined;
        }

        return {
          node: new SvgElementNode(
            openingTag.tagName,
            openingTag.id,
            new SvgOffsetRange(elementStart, closingTag.end),
            new SvgOffsetRange(elementStart, openingTag.end),
            children,
          ),
          end: closingTag.end,
        };
      }

      const child = this.parseElement();

      if (child === undefined) {
        return undefined;
      }

      children.push(child.node);
      this.offset = child.end;
    }
  }

  private readOpeningTag(): OpeningTag | undefined {
    if (this.source[this.offset] !== "<") {
      return undefined;
    }

    const tagStart = this.offset;
    const nameStart = tagStart + 1;
    const nameEnd = this.readNameEnd(nameStart);

    if (nameEnd === nameStart) {
      return undefined;
    }

    const tagEnd = this.findTagEnd(nameEnd);

    if (tagEnd === undefined) {
      return undefined;
    }

    const tagName = this.source.slice(nameStart, nameEnd);
    const attributes = this.source.slice(nameEnd, tagEnd);
    const contentBeforeClosingBracket = this.source.slice(
      nameEnd,
      tagEnd,
    ).trimEnd();
    const isSelfClosing = contentBeforeClosingBracket.endsWith("/");

    this.offset = tagEnd + 1;

    return {
      tagName,
      id: this.readIdAttribute(attributes),
      end: tagEnd + 1,
      isSelfClosing,
    };
  }

  private readClosingTag(): ClosingTag | undefined {
    if (!this.source.startsWith("</", this.offset)) {
      return undefined;
    }

    const nameStart = this.offset + 2;
    const nameEnd = this.readNameEnd(nameStart);

    if (nameEnd === nameStart) {
      return undefined;
    }

    const closingStart = this.offset;
    let cursor = nameEnd;

    while (cursor < this.source.length && this.isWhitespace(this.source[cursor])) {
      cursor += 1;
    }

    if (this.source[cursor] !== ">") {
      return undefined;
    }

    this.offset = cursor + 1;

    return {
      tagName: this.source.slice(nameStart, nameEnd),
      end: closingStart + (cursor - closingStart) + 1,
    };
  }

  private readNameEnd(start: number): number {
    let cursor = start;

    if (!this.isNameStart(this.source[cursor])) {
      return start;
    }

    cursor += 1;

    while (cursor < this.source.length && this.isNamePart(this.source[cursor])) {
      cursor += 1;
    }

    return cursor;
  }

  private findTagEnd(start: number): number | undefined {
    let quote: string | undefined;

    for (let cursor = start; cursor < this.source.length; cursor += 1) {
      const character = this.source[cursor];

      if (quote !== undefined) {
        if (character === quote) {
          quote = undefined;
        }

        continue;
      }

      if (character === '"' || character === "'") {
        quote = character;
        continue;
      }

      if (character === ">") {
        return cursor;
      }
    }

    return undefined;
  }

  private readIdAttribute(attributes: string): string | undefined {
    const match = attributes.match(
      /(?:^|\s)id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/,
    );

    return match?.[1] ?? match?.[2] ?? match?.[3];
  }

  private skipDocumentProlog(): void {
    while (true) {
      while (
        this.offset < this.source.length &&
        this.isWhitespace(this.source[this.offset])
      ) {
        this.offset += 1;
      }

      if (this.consumeComment() || this.consumeDeclaration()) {
        continue;
      }

      if (this.consumeProcessingInstruction()) {
        continue;
      }

      return;
    }
  }

  private skipElementContent(): void {
    while (this.offset < this.source.length) {
      if (this.source[this.offset] !== "<") {
        this.offset += 1;
        continue;
      }

      if (this.consumeComment() || this.consumeDeclaration()) {
        continue;
      }

      if (this.consumeProcessingInstruction()) {
        continue;
      }

      return;
    }
  }

  private consumeComment(): boolean {
    const startMarker = "<!--";

    if (!this.source.startsWith(startMarker, this.offset)) {
      return false;
    }

    return this.consumeUntil("-->");
  }

  private consumeProcessingInstruction(): boolean {
    if (!this.source.startsWith("<?", this.offset)) {
      return false;
    }

    return this.consumeUntil("?>");
  }

  private consumeDeclaration(): boolean {
    if (!this.source.startsWith("<!", this.offset)) {
      return false;
    }

    if (this.source.startsWith("<![CDATA[", this.offset)) {
      return this.consumeUntil("]]>");
    }

    let quote: string | undefined;
    let bracketDepth = 0;

    for (
      let cursor = this.offset + 2;
      cursor < this.source.length;
      cursor += 1
    ) {
      const character = this.source[cursor];

      if (quote !== undefined) {
        if (character === quote) {
          quote = undefined;
        }

        continue;
      }

      if (character === '"' || character === "'") {
        quote = character;
        continue;
      }

      if (character === "[") {
        bracketDepth += 1;
        continue;
      }

      if (character === "]" && bracketDepth > 0) {
        bracketDepth -= 1;
        continue;
      }

      if (character === ">" && bracketDepth === 0) {
        this.offset = cursor + 1;
        return true;
      }
    }

    return false;
  }

  private consumeUntil(endMarker: string): boolean {
    const end = this.source.indexOf(endMarker, this.offset);

    if (end < 0) {
      this.offset = this.source.length;
      return false;
    }

    this.offset = end + endMarker.length;
    return true;
  }

  private isWhitespace(character: string | undefined): boolean {
    return character !== undefined && /\s/.test(character);
  }

  private isNameStart(character: string | undefined): boolean {
    return character !== undefined && /[A-Za-z_:]/.test(character);
  }

  private isNamePart(character: string | undefined): boolean {
    return character !== undefined && /[A-Za-z0-9_.:-]/.test(character);
  }
}
