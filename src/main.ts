import { ConsoleInputReader } from "./cli/io/ConsoleInputReader";
import { ConsoleOutputWriter } from "./cli/io/ConsoleOutputWriter";
import { CommandLineParser } from "./cli/parser/CommandLineParser";
import { CommandLoop } from "./cli/session/CommandLoop";
import { CommandSession } from "./cli/session/CommandSession";
import { CommandExecutor } from "./core/CommandExecutor";
import { CommandHistory } from "./core/history/CommandHistory";
import { EditorReceiver } from "./core/receiver/EditorReceiver";
import { ShapeFactory } from "./protocol/shapes/factory/ShapeFactory";

async function main(): Promise<void> {
  const inputReader = new ConsoleInputReader();
  const outputWriter = new ConsoleOutputWriter();
  const history = new CommandHistory();
  const editorReceiver = new EditorReceiver(history);
  const session = new CommandSession(
    new CommandLineParser(new ShapeFactory()),
    new CommandExecutor(editorReceiver, history),
    outputWriter,
  );
  const commandLoop = new CommandLoop(
    inputReader,
    outputWriter,
    session,
    "svg-editor 0.1 — type 'help' for commands",
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
