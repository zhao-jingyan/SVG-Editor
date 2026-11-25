import * as vscode from "vscode";
import { SvgFileDecorationProvider } from "./file/SvgFileDecorationProvider";

export function activate(context: vscode.ExtensionContext): void {
  const fileDecorationProvider = new SvgFileDecorationProvider();

  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(fileDecorationProvider),
  );
}

export function deactivate(): void {}
