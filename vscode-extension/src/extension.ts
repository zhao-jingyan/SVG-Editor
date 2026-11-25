import * as vscode from "vscode";
import { SvgFileDecorationProvider } from "./file/SvgFileDecorationProvider";
import { SvgDocumentSymbolProvider } from "./outline/SvgDocumentSymbolProvider";

export function activate(context: vscode.ExtensionContext): void {
  const fileDecorationProvider = new SvgFileDecorationProvider();
  const documentSymbolProvider = new SvgDocumentSymbolProvider();

  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(fileDecorationProvider),
    vscode.languages.registerDocumentSymbolProvider(
      "*",
      documentSymbolProvider,
    ),
  );
}

export function deactivate(): void {}
