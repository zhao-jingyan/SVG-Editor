import type { SvgDocumentNode } from "../model/SvgDocumentNode";
import type { SvgElementNode } from "../model/SvgElementNode";
import type { SvgNodeVisitor } from "./SvgNodeVisitor";
import { SvgSymbolDto } from "./SvgSymbolDto";

export class SvgOutlineVisitor implements SvgNodeVisitor<SvgSymbolDto> {
  public visitDocument(node: SvgDocumentNode): SvgSymbolDto {
    return node.getRoot().accept(this);
  }

  public visitElement(node: SvgElementNode): SvgSymbolDto {
    return new SvgSymbolDto(
      node.getLabel(),
      node.getRange(),
      node.getSelectionRange(),
      node.getChildren().map((child) => child.accept(this)),
    );
  }
}
