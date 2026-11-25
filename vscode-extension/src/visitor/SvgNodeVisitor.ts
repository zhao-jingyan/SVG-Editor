import type { SvgDocumentNode } from "../model/SvgDocumentNode";
import type { SvgElementNode } from "../model/SvgElementNode";

export interface SvgNodeVisitor<T> {
  visitDocument(node: SvgDocumentNode): T;

  visitElement(node: SvgElementNode): T;
}
