import { ConsoleInputReader } from "@/cli/io/ConsoleInputReader";
import { ConsoleOutputWriter } from "@/cli/io/ConsoleOutputWriter";
import { CommandLineParser } from "@/cli/parser/CommandLineParser";
import { CommandLoop } from "@/cli/session/CommandLoop";
import { CommandSession } from "@/cli/session/CommandSession";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { CommandExecutor } from "@/core/CommandExecutor";
import { HelpText } from "@/core/display/HelpText";
import { CommandHistory } from "@/core/history/CommandHistory";
import { FileSvgStorage } from "@/core/io/FileSvgStorage";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { BuiltinContributionInstaller } from "@/assembly/BuiltinContributionInstaller";
import { CodePluginInstaller } from "@/assembly/CodePluginInstaller";
import { loadPluginsFromConfig } from "@/host/loadPluginsFromConfig";
import { parseConfigArg } from "@/host/parseConfigArg";
import { PluginHost } from "@/host/PluginHost";

async function main(): Promise<void> {
  const configPath = parseConfigArg(process.argv.slice(2));
  const inputReader = new ConsoleInputReader();
  const outputWriter = new ConsoleOutputWriter();
  const history = new CommandHistory();
  const shapeCatalog = new ShapeRegistry();
  const registry = new CommandRegistry();
  const builtins = new BuiltinContributionInstaller(shapeCatalog, registry);
  builtins.installLeafShapes();
  builtins.installCommands();

  const attributeCatalog = new AttributeRegistry();
  const treeDecorators = new TreeDecoratorRegistry();
  const host = new PluginHost(
    registry,
    shapeCatalog,
    attributeCatalog,
    treeDecorators,
  );

  if (configPath !== undefined) {
    await loadPluginsFromConfig(host, configPath);
  } else {
    await new CodePluginInstaller(host).install();
  }

  // box 插件须先于普通 g
  builtins.installGroupShape();

  const helpText = new HelpText(registry);
  const editorCommandReceiver = new EditorCommandReceiver(
    history,
    new FileSvgStorage(),
    helpText,
    shapeCatalog,
    attributeCatalog,
    treeDecorators,
  );
  const session = new CommandSession(
    new CommandLineParser(registry),
    new CommandExecutor(editorCommandReceiver, history),
    outputWriter,
  );
  const commandLoop = new CommandLoop(
    inputReader,
    outputWriter,
    session,
    "svg-editor 1.0.0 — type 'help' for commands",
  );

  try {
    await commandLoop.run();
  } finally {
    inputReader.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
