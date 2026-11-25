import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  const extensionDevelopmentPath = resolve(__dirname, "../..");
  const extensionTestsPath = resolve(__dirname, "./integration/index");
  const workspacePath = join(
    extensionDevelopmentPath,
    "test-fixtures",
    "workspace",
  );
  const configuredExecutable = process.env.VSCODE_EXECUTABLE_PATH;
  const defaultExecutable =
    "/Applications/Visual Studio Code.app/Contents/MacOS/Electron";
  const executablePath =
    configuredExecutable ??
    (existsSync(defaultExecutable) ? defaultExecutable : undefined);

  await runTests({
    ...(executablePath === undefined
      ? {}
      : { vscodeExecutablePath: executablePath }),
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [workspacePath, "--disable-extensions"],
  });
}

main().catch((error: unknown) => {
  console.error("VSCode 扩展集成测试失败：", error);
  process.exitCode = 1;
});
