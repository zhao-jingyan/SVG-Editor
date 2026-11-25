import { extname } from "node:path";
import * as vscode from "vscode";
import { SvgOffsetRange } from "../model/SvgOffsetRange";
import { SvgOutlineParser } from "../parser/SvgOutlineParser";
import { SvgOutlineVisitor } from "../visitor/SvgOutlineVisitor";
import { SvgSymbolDto } from "../visitor/SvgSymbolDto";

export class SvgDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  private readonly parser = new SvgOutlineParser();
  private readonly outlineVisitor = new SvgOutlineVisitor();

  public provideDocumentSymbols(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.DocumentSymbol[] {
    if (extname(document.uri.path).toLowerCase() !== ".svg") {
      return [];
    }

    try {
      const svgDocument = this.parser.parse(document.getText());

      if (svgDocument === undefined) {
        return [];
      }

      const rootSymbol = svgDocument.accept(this.outlineVisitor);

      return [this.toDocumentSymbol(document, rootSymbol)];
    } catch {
      return [];
    }
  }

  private toDocumentSymbol(
    document: vscode.TextDocument,
    symbol: SvgSymbolDto,
  ): vscode.DocumentSymbol {
    const documentSymbol = new vscode.DocumentSymbol(
      symbol.getLabel(),
      "",
      vscode.SymbolKind.Object,
      this.toRange(document, symbol.getRange()),
      this.toRange(document, symbol.getSelectionRange()),
    );

    documentSymbol.children = symbol
      .getChildren()
      .map((child) => this.toDocumentSymbol(document, child));

    return documentSymbol;
  }

  private toRange(
    document: vscode.TextDocument,
    range: SvgOffsetRange,
  ): vscode.Range {
    return new vscode.Range(
      document.positionAt(range.getStart()),
      document.positionAt(range.getEnd()),
    );
  }
}
