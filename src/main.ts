import { ConsoleInputReader } from "./cli/ConsoleInputReader";
import { ConsoleOutputWriter } from "./cli/ConsoleOutputWriter";
import { CommandLineParser } from "./cli/CommandLineParser";
import { Repl } from "./cli/Repl";
import { DemoCommandContext } from "./core/DemoCommandContext";
import { DemoExecutor } from "./core/DemoExecutor";
import { ShapeFactory } from "./protocol/shapes/ShapeFactory";

const inputReader = new ConsoleInputReader();
const repl = new Repl(
  inputReader,
  new ConsoleOutputWriter(),
  new CommandLineParser(new ShapeFactory()),
  new DemoExecutor(new DemoCommandContext()),
);

repl.run().finally(() => inputReader.close());
