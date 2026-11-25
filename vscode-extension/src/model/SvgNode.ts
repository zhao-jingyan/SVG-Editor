import type { SvgNodeVisitor } from "../visitor/SvgNodeVisitor";

export abstract class SvgNode {
  public abstract accept<T>(visitor: SvgNodeVisitor<T>): T;
}
