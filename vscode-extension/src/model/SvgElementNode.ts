import type { SvgNodeVisitor } from "../visitor/SvgNodeVisitor";
import { SvgNode } from "./SvgNode";
import { SvgOffsetRange } from "./SvgOffsetRange";

export class SvgElementNode extends SvgNode {
  private readonly children: readonly SvgElementNode[];

  public constructor(
    private readonly tagName: string,
    private readonly id: string | undefined,
    private readonly range: SvgOffsetRange,
    private readonly selectionRange: SvgOffsetRange,
    children: readonly SvgElementNode[] = [],
  ) {
    super();

    if (tagName.trim().length === 0) {
      throw new Error("SVG 标签名不能为空");
    }

    this.children = Object.freeze([...children]);
  }

  public getLabel(): string {
    return this.id === undefined ? this.tagName : `${this.tagName}#${this.id}`;
  }

  public getChildren(): readonly SvgElementNode[] {
    return this.children;
  }

  public getRange(): SvgOffsetRange {
    return this.range;
  }

  public getSelectionRange(): SvgOffsetRange {
    return this.selectionRange;
  }

  public accept<T>(visitor: SvgNodeVisitor<T>): T {
    return visitor.visitElement(this);
  }
}
