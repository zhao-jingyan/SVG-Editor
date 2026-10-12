import { ConsoleInputReader } from "./cli/ConsoleInputReader";
import { ConsoleOutputWriter } from "./cli/ConsoleOutputWriter";
import { Repl } from "./cli/Repl";
import { DemoExecutor } from "./core/DemoExecutor";

const inputReader = new ConsoleInputReader();
const repl = new Repl(inputReader, new ConsoleOutputWriter(), new DemoExecutor());

repl.run().finally(() => inputReader.close());
