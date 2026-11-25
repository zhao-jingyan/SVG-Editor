import { extname } from "node:path";
import * as vscode from "vscode";

export class SvgFileDecorationProvider
  implements vscode.FileDecorationProvider
{
  public async provideFileDecoration(
    resource: vscode.Uri,
    token: vscode.CancellationToken,
  ): Promise<vscode.FileDecoration | undefined> {
    if (extname(resource.path).toLowerCase() !== ".svg") {
      return undefined;
    }

    try {
      const resourceStat = await vscode.workspace.fs.stat(resource);

      if (
        token.isCancellationRequested ||
        (resourceStat.type & vscode.FileType.Directory) !== 0
      ) {
        return undefined;
      }

      return {
        badge: "[]",
        tooltip: "SVG 文件",
      };
    } catch {
      return undefined;
    }
  }
}
