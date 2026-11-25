import { ConsoleInputReader } from "@/cli/io/ConsoleInputReader";
import { ConsoleOutputWriter } from "@/cli/io/ConsoleOutputWriter";
import { CommandLineParser } from "@/cli/parser/CommandLineParser";
import { CommandLoop } from "@/cli/session/CommandLoop";
import { CommandSession } from "@/cli/session/CommandSession";
import { AddToCommandContribution } from "@/_builtin/commands/AddToCommand/AddToCommandContribution";
import { BackCommandContribution } from "@/_builtin/commands/ReorderCommand/BackCommandContribution";
import { CanvasCommandContribution } from "@/_builtin/commands/CanvasCommand/CanvasCommandContribution";
import { CreateCommandContribution } from "@/_builtin/commands/CreateCommand/CreateCommandContribution";
import { DeleteCommandContribution } from "@/_builtin/commands/DeleteCommand/DeleteCommandContribution";
import { ExitCommandContribution } from "@/_builtin/commands/ExitCommand/ExitCommandContribution";
import { FrontCommandContribution } from "@/_builtin/commands/ReorderCommand/FrontCommandContribution";
import { GroupCommandContribution } from "@/_builtin/commands/GroupCommand/GroupCommandContribution";
import { HelpCommandContribution } from "@/_builtin/commands/HelpCommand/HelpCommandContribution";
import { InitCommandContribution } from "@/_builtin/commands/InitCommand/InitCommandContribution";
import { MoveCommandContribution } from "@/_builtin/commands/MoveCommand/MoveCommandContribution";
import { ReadCommandContribution } from "@/_builtin/commands/ReadCommand/ReadCommandContribution";
import { RedoCommandContribution } from "@/_builtin/commands/RedoCommand/RedoCommandContribution";
import { SaveCommandContribution } from "@/_builtin/commands/SaveCommand/SaveCommandContribution";
import { ScaleCommandContribution } from "@/_builtin/commands/ScaleCommand/ScaleCommandContribution";
import { SetCommandContribution } from "@/_builtin/commands/SetCommand/SetCommandContribution";
import { ShowCommandContribution } from "@/_builtin/commands/ShowCommand/ShowCommandContribution";
import { TreeCommandContribution } from "@/_builtin/commands/TreeCommand/TreeCommandContribution";
import { UndoCommandContribution } from "@/_builtin/commands/UndoCommand/UndoCommandContribution";
import { UngroupCommandContribution } from "@/_builtin/commands/UngroupCommand/UngroupCommandContribution";
import { DirCommandContribution } from "@/_plugin/commands/DirCommand/DirCommandContribution";
import { StatsCommandContribution } from "@/_plugin/commands/StatsCommand/StatsCommandContribution";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { CommandExecutor } from "@/core/CommandExecutor";
import { HelpText } from "@/core/display/HelpText";
import { CommandHistory } from "@/core/history/CommandHistory";
import { FileSvgStorage } from "@/core/io/FileSvgStorage";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { ShapeFactory } from "@/protocol/shapes/factory/ShapeFactory";

async function main(): Promise<void> {
  const inputReader = new ConsoleInputReader();
  const outputWriter = new ConsoleOutputWriter();
  const history = new CommandHistory();
  const shapeFactory = new ShapeFactory();
  const registry = new CommandRegistry();
  // Phase 1 help 顺序，其后追加插件命令
  registry.registerAll([
    InitCommandContribution.create(),
    ReadCommandContribution.create(),
    SaveCommandContribution.create(),
    CanvasCommandContribution.create(),
    CreateCommandContribution.create(shapeFactory),
    DeleteCommandContribution.create(),
    MoveCommandContribution.create(),
    ScaleCommandContribution.create(),
    SetCommandContribution.create(),
    GroupCommandContribution.create(),
    UngroupCommandContribution.create(),
    AddToCommandContribution.create(),
    FrontCommandContribution.create(),
    BackCommandContribution.create(),
    TreeCommandContribution.create(),
    ShowCommandContribution.create(),
    UndoCommandContribution.create(),
    RedoCommandContribution.create(),
    HelpCommandContribution.create(),
    ExitCommandContribution.create(),
    StatsCommandContribution.create(),
    DirCommandContribution.create(),
  ]);
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
