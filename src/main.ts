import { ConsoleInputReader } from "./cli/ConsoleInputReader";
import { ConsoleOutputWriter } from "./cli/ConsoleOutputWriter";
import { CommandLineParser } from "./cli/CommandLineParser";
import { Repl } from "./cli/Repl";
import { CommandExecutor } from "./core/CommandExecutor";
import { EditorContext } from "./core/EditorContext";
import { ShapeFactory } from "./protocol/shapes/ShapeFactory";

const inputReader = new ConsoleInputReader();
const editorContext = new EditorContext();
const repl = new Repl(
  inputReader,
  new ConsoleOutputWriter(),
  new CommandLineParser(new ShapeFactory()),
  new CommandExecutor(editorContext),
);

repl.run().finally(() => inputReader.close());
