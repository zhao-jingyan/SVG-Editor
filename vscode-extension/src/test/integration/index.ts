import * as assert from "node:assert/strict";
import { join } from "node:path";
import * as vscode from "vscode";
import { activate } from "../../extension";
import { SvgDocumentSymbolProvider } from "../../outline/SvgDocumentSymbolProvider";

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

function replaceExtensionApiMethod(
  target: object,
  propertyName: string,
  replacement: (...args: unknown[]) => vscode.Disposable,
): () => void {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    target,
    propertyName,
  );

  assert.ok(originalDescriptor, `${propertyName} 应存在于 VSCode API 对象`);

  Object.defineProperty(target, propertyName, {
    configurable: true,
    enumerable: originalDescriptor.enumerable,
    writable: true,
    value: replacement,
  });

  return (): void => {
    Object.defineProperty(target, propertyName, originalDescriptor);
  };
}

async function verifyFileDecoration(): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, "集成测试必须打开固定工作目录");

  let registeredProvider: vscode.FileDecorationProvider | undefined;
  const restoreFileDecorationRegistration = replaceExtensionApiMethod(
    vscode.window,
    "registerFileDecorationProvider",
    (provider): vscode.Disposable => {
      registeredProvider = provider as vscode.FileDecorationProvider;
      return new vscode.Disposable(() => {});
    },
  );
  const restoreDocumentSymbolRegistration = replaceExtensionApiMethod(
    vscode.languages,
    "registerDocumentSymbolProvider",
    (): vscode.Disposable => new vscode.Disposable(() => {}),
  );
  const subscriptions: vscode.Disposable[] = [];

  try {
    activate({
      subscriptions,
    } as unknown as vscode.ExtensionContext);
  } finally {
    restoreDocumentSymbolRegistration();
    restoreFileDecorationRegistration();
  }

  assert.equal(subscriptions.length, 2, "扩展激活时应注册两个 Provider");
  assert.ok(registeredProvider, "扩展激活时应注册文件装饰 Provider");

  const cancellation = new vscode.CancellationTokenSource();
  const svgDecoration = await registeredProvider.provideFileDecoration(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "example.svg")),
    cancellation.token,
  );
  const textDecoration = await registeredProvider.provideFileDecoration(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "notes.txt")),
    cancellation.token,
  );
  const directoryDecoration = await registeredProvider.provideFileDecoration(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "folder.svg")),
    cancellation.token,
  );

  cancellation.dispose();

  assert.equal(svgDecoration?.badge, "[]");
  assert.equal(textDecoration, undefined);
  assert.equal(directoryDecoration, undefined);
}

async function executeOutline(
  document: vscode.TextDocument,
): Promise<readonly vscode.DocumentSymbol[]> {
  // 当前 VSCode 的公开测试命令无法转换自定义 DocumentSymbol，直接验证原生 Outline 模型入口。
  const symbols = await vscode.commands.executeCommand<
    vscode.DocumentSymbol[] | undefined
  >("_executeDocumentSymbolProvider", document.uri);

  assert.ok(symbols, "SVG 文档应能取得 DocumentSymbol");
  return symbols;
}

async function replaceDocument(
  document: vscode.TextDocument,
  content: string,
): Promise<void> {
  const edit = new vscode.WorkspaceEdit();
  edit.replace(
    document.uri,
    new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length),
    ),
    content,
  );
  const applied = await vscode.workspace.applyEdit(edit);

  assert.ok(applied, "应能修改 SVG 文档");
  await document.save();
}

async function verifyDocumentOutline(): Promise<void> {
  await activateExtension();

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, "集成测试必须打开固定工作目录");

  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "example.svg")),
  );
  const originalContent = document.getText();
  try {
    await vscode.window.showTextDocument(document);

    const symbols = await executeOutline(document);
    const root = symbols[0];
    const group = root.children[0];
    const rectangle = group.children[0];
    const text = group.children[1];

    assert.equal(root.name, "svg");
    assert.equal(group.name, "g#flowchart");
    assert.equal(rectangle.name, "rect#start");
    assert.equal(text.name, "text");

    const cancellation = new vscode.CancellationTokenSource();
    const providerSymbols = new SvgDocumentSymbolProvider().provideDocumentSymbols(
      document,
      cancellation.token,
    );
    const providerRectangle = providerSymbols[0].children?.[0].children?.[0];
    cancellation.dispose();

    assert.ok(providerRectangle);
    assert.equal(providerRectangle.selectionRange.start.line, 3);
    assert.equal(providerRectangle.selectionRange.start.character, 4);

    await replaceDocument(
      document,
      originalContent.replace(
        "  </g>",
        '    <circle id="decision" cx="200" cy="50" r="20" />\n  </g>',
      ),
    );

    const updatedSymbols = await executeOutline(document);
    assert.equal(
      updatedSymbols[0].children[0].children[2].name,
      "circle#decision",
    );

    await replaceDocument(document, '<svg><g id="broken">');
    const brokenSymbols = await executeOutline(document);
    assert.deepEqual(brokenSymbols, []);
  } finally {
    if (document.getText() !== originalContent) {
      await replaceDocument(document, originalContent);
    }
  }
}

async function verifyAttributeValueIsNotTreatedAsId(): Promise<void> {
  await activateExtension();

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, "集成测试必须打开固定工作目录");

  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(join(workspaceFolder.uri.fsPath, "example.svg")),
  );
  const originalContent = document.getText();
  try {
    await vscode.window.showTextDocument(document);
    await replaceDocument(
      document,
      '<svg><rect data-note="node id=wrong" id="right"/></svg>',
    );

    const symbols = await executeOutline(document);

    assert.equal(symbols[0].children[0].name, "rect#right");
  } finally {
    if (document.getText() !== originalContent) {
      await replaceDocument(document, originalContent);
    }
  }
}

const tests: readonly IntegrationTest[] = [
  {
    name: "扩展注册文件装饰并按规则标记普通 SVG 文件",
    run: verifyFileDecoration,
  },
  {
    name: "原生大纲展示层级并在编辑后更新",
    run: verifyDocumentOutline,
  },
  {
    name: "原生大纲不会把属性值中的 id 文本识别为 id",
    run: verifyAttributeValueIsNotTreatedAsId,
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
