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
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import type { ShapeCatalog } from "@/protocol/shapes/contribution/ShapeCatalog";
import { createBuiltinShapeCatalog } from "./createBuiltinShapeCatalog";

/** 测试夹具：按 Phase 1 help 顺序注册全部内置贡献。 */
export function createBuiltinCatalog(
  shapeCatalog: ShapeCatalog = createBuiltinShapeCatalog(),
): CommandRegistry {
  const registry = new CommandRegistry();
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
  ]);
  return registry;
}
