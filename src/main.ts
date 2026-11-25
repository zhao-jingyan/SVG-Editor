import { ConsoleInputReader } from "./cli/io/ConsoleInputReader";
import { ConsoleOutputWriter } from "./cli/io/ConsoleOutputWriter";
import { CommandLineParser } from "./cli/parser/CommandLineParser";
import { CommandLoop } from "./cli/session/CommandLoop";
import { CommandSession } from "./cli/session/CommandSession";
import { BuiltinCommandPlugin } from "./cli/plugins/BuiltinCommandPlugin";
import { CommandDefinitionRegistry } from "./cli/parser/commands/definition/CommandDefinitionRegistry";
import { CommandExecutor } from "./core/CommandExecutor";
import { HelpText } from "./core/display/HelpText";
import { CommandHistory } from "./core/history/CommandHistory";
import { EditorCommandReceiver } from "./core/receiver/EditorCommandReceiver";
import { PluginHost } from "./plugins/PluginHost";
import { ShapeFactory } from "./protocol/shapes/factory/ShapeFactory";

async function main(): Promise<void> {
  const inputReader = new ConsoleInputReader();
  const outputWriter = new ConsoleOutputWriter();
  const history = new CommandHistory();
  const commands = new CommandDefinitionRegistry();
  const pluginHost = new PluginHost({ commands });
  await pluginHost.activate(new BuiltinCommandPlugin(new ShapeFactory()));
  const helpText = new HelpText(commands);
  const editorCommandReceiver = new EditorCommandReceiver(history, helpText);
  const session = new CommandSession(
    new CommandLineParser(commands),
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
