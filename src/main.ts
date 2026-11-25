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
import { CircleShapeContribution } from "@/_builtin/shapes/CircleShape/CircleShapeContribution";
import { EllipseShapeContribution } from "@/_builtin/shapes/EllipseShape/EllipseShapeContribution";
import { GroupShapeContribution } from "@/_builtin/shapes/GroupShape/GroupShapeContribution";
import { LineShapeContribution } from "@/_builtin/shapes/LineShape/LineShapeContribution";
import { RectShapeContribution } from "@/_builtin/shapes/RectShape/RectShapeContribution";
import { TextShapeContribution } from "@/_builtin/shapes/TextShape/TextShapeContribution";
import { DirCommandContribution } from "@/_plugin/commands/DirCommand/DirCommandContribution";
import { StatsCommandContribution } from "@/_plugin/commands/StatsCommand/StatsCommandContribution";
import { BoxAttributeHandler } from "@/_plugin/shapes/BoxShape/BoxAttributeHandler";
import { BoxShapeContribution } from "@/_plugin/shapes/BoxShape/BoxShapeContribution";
import { BoxTypeLabelDecorator } from "@/_plugin/tree/BoxTypeLabelDecorator";
import { ModifiedStarDecorator } from "@/_plugin/tree/ModifiedStarDecorator";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { CommandExecutor } from "@/core/CommandExecutor";
import { HelpText } from "@/core/display/HelpText";
import { CommandHistory } from "@/core/history/CommandHistory";
import { FileSvgStorage } from "@/core/io/FileSvgStorage";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";

async function main(): Promise<void> {
  const inputReader = new ConsoleInputReader();
  const outputWriter = new ConsoleOutputWriter();
  const history = new CommandHistory();
  const shapeCatalog = new ShapeRegistry();
  shapeCatalog.registerAll([
    RectShapeContribution.create(),
    CircleShapeContribution.create(),
    EllipseShapeContribution.create(),
    LineShapeContribution.create(),
    TextShapeContribution.create(),
    // box 须先于普通 g，才能认领 data-kind="box"
    BoxShapeContribution.create(),
    GroupShapeContribution.create(),
  ]);
  const registry = new CommandRegistry();
  // Phase 1 help 顺序，其后追加插件命令
  registry.registerAll([
    InitCommandContribution.create(),
    ReadCommandContribution.create(),
    SaveCommandContribution.create(),
    CanvasCommandContribution.create(),
    CreateCommandContribution.create(shapeCatalog),
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
  const attributeCatalog = new AttributeRegistry();
  attributeCatalog.register(new BoxAttributeHandler());
  const treeDecorators = new TreeDecoratorRegistry();
  // 顺序：(box) 在前，* 在后 → `g#n1 (box) *`
  treeDecorators.registerAll([
    new BoxTypeLabelDecorator(),
    new ModifiedStarDecorator(),
  ]);
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
