import * as assert from "node:assert/strict";
import { join } from "node:path";
import * as vscode from "vscode";
import { SvgFileDecorationProvider } from "../../file/SvgFileDecorationProvider";

interface IntegrationTest {
  readonly name: string;
  readonly run: () => Promise<void>;
}

async function activateExtension(): Promise<void> {
  const extension = vscode.extensions.getExtension(
    "svg-editor-lab.svg-editor-vscode",
  );

  assert.ok(extension, "应能发现 SVG Editor 扩展");
  await extension.activate();
}

async function verifyFileDecoration(): Promise<void> {
  await activateExtension();

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, "集成测试必须打开固定工作目录");

  const provider = new SvgFileDecorationProvider();
  const cancellation = new vscode.CancellationTokenSource();
  const svgDecoration = await provider.provideFileDecoration(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "example.svg")),
    cancellation.token,
  );
  const textDecoration = await provider.provideFileDecoration(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "notes.txt")),
    cancellation.token,
  );
  const directoryDecoration = await provider.provideFileDecoration(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "folder.svg")),
    cancellation.token,
  );

  cancellation.dispose();

  assert.equal(svgDecoration?.badge, "[]");
  assert.equal(textDecoration, undefined);
  assert.equal(directoryDecoration, undefined);
}

const tests: readonly IntegrationTest[] = [
  {
    name: "Explorer 装饰只标记普通 SVG 文件",
    run: verifyFileDecoration,
  },
];

export async function run(): Promise<void> {
  const failures: string[] = [];

  for (const test of tests) {
    try {
      await test.run();
      console.log(`通过：${test.name}`);
    } catch (error: unknown) {
      failures.push(`${test.name}: ${String(error)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
}
