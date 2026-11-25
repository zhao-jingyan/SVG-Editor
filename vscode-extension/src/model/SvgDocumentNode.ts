import type { SvgNodeVisitor } from "../visitor/SvgNodeVisitor";
import type { SvgElementNode } from "./SvgElementNode";
import { SvgNode } from "./SvgNode";

export class SvgDocumentNode extends SvgNode {
  public constructor(private readonly root: SvgElementNode) {
    super();
  }

  public getRoot(): SvgElementNode {
    return this.root;
  }

  public accept<T>(visitor: SvgNodeVisitor<T>): T {
    return visitor.visitDocument(this);
  }
}
