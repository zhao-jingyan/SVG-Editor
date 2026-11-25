import { ConsoleInputReader } from "./cli/io/ConsoleInputReader";
import { ConsoleOutputWriter } from "./cli/io/ConsoleOutputWriter";
import { CommandLineParser } from "./cli/parser/CommandLineParser";
import { CommandLoop } from "./cli/session/CommandLoop";
import { CommandSession } from "./cli/session/CommandSession";
import { BuiltinCommandContributions } from "./core/commands/BuiltinCommandContributions";
import { CommandRegistry } from "./core/commands/CommandRegistry";
import { CommandExecutor } from "./core/CommandExecutor";
import { HelpText } from "./core/display/HelpText";
import { CommandHistory } from "./core/history/CommandHistory";
import { FileSvgStorage } from "./core/io/FileSvgStorage";
import { EditorCommandReceiver } from "./core/receiver/EditorCommandReceiver";
import { ShapeFactory } from "./protocol/shapes/factory/ShapeFactory";

async function main(): Promise<void> {
  const inputReader = new ConsoleInputReader();
  const outputWriter = new ConsoleOutputWriter();
  const history = new CommandHistory();
  const registry = new CommandRegistry();
  registry.registerAll(
    new BuiltinCommandContributions(new ShapeFactory()).create(),
  );
  const helpText = new HelpText(registry);
  const editorCommandReceiver = new EditorCommandReceiver(
    history,
    new FileSvgStorage(),
    helpText,
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
