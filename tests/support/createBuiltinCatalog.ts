import { AddToCommandContribution } from "@/builtin/commands/AddToCommand/AddToCommandContribution";
import { BackCommandContribution } from "@/builtin/commands/ReorderCommand/BackCommandContribution";
import { CanvasCommandContribution } from "@/builtin/commands/CanvasCommand/CanvasCommandContribution";
import { CreateCommandContribution } from "@/builtin/commands/CreateCommand/CreateCommandContribution";
import { DeleteCommandContribution } from "@/builtin/commands/DeleteCommand/DeleteCommandContribution";
import { ExitCommandContribution } from "@/builtin/commands/ExitCommand/ExitCommandContribution";
import { FrontCommandContribution } from "@/builtin/commands/ReorderCommand/FrontCommandContribution";
import { GroupCommandContribution } from "@/builtin/commands/GroupCommand/GroupCommandContribution";
import { HelpCommandContribution } from "@/builtin/commands/HelpCommand/HelpCommandContribution";
import { InitCommandContribution } from "@/builtin/commands/InitCommand/InitCommandContribution";
import { MoveCommandContribution } from "@/builtin/commands/MoveCommand/MoveCommandContribution";
import { ReadCommandContribution } from "@/builtin/commands/ReadCommand/ReadCommandContribution";
import { RedoCommandContribution } from "@/builtin/commands/RedoCommand/RedoCommandContribution";
import { SaveCommandContribution } from "@/builtin/commands/SaveCommand/SaveCommandContribution";
import { ScaleCommandContribution } from "@/builtin/commands/ScaleCommand/ScaleCommandContribution";
import { SetCommandContribution } from "@/builtin/commands/SetCommand/SetCommandContribution";
import { ShowCommandContribution } from "@/builtin/commands/ShowCommand/ShowCommandContribution";
import { TreeCommandContribution } from "@/builtin/commands/TreeCommand/TreeCommandContribution";
import { UndoCommandContribution } from "@/builtin/commands/UndoCommand/UndoCommandContribution";
import { UngroupCommandContribution } from "@/builtin/commands/UngroupCommand/UngroupCommandContribution";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { ShapeFactory } from "@/protocol/shapes/factory/ShapeFactory";

/** 测试夹具：按 Phase 1 help 顺序注册全部内置贡献。 */
export function createBuiltinCatalog(
  shapeFactory: ShapeFactory = new ShapeFactory(),
): CommandRegistry {
  const registry = new CommandRegistry();
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
  ]);
  return registry;
}
