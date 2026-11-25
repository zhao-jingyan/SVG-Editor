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
import type { CommandRegistry } from "@/core/commands/CommandRegistry";
import type { ShapeCatalog } from "@/protocol/shapes/contribution/ShapeCatalog";
import type { ShapeRegistry } from "@/core/shapes/ShapeRegistry";

/** 注册叶子内置图形；不含 g，以便插件 box 可插在 g 之前。 */
export function registerBuiltinLeafShapes(shapeCatalog: ShapeRegistry): void {
  shapeCatalog.registerAll([
    RectShapeContribution.create(),
    CircleShapeContribution.create(),
    EllipseShapeContribution.create(),
    LineShapeContribution.create(),
    TextShapeContribution.create(),
  ]);
}

/** 插件装入后再注册 g，保证 data-kind=box 优先于普通 g。 */
export function registerBuiltinGroupShape(shapeCatalog: ShapeRegistry): void {
  shapeCatalog.register(GroupShapeContribution.create());
}

/** Phase 1 内置命令（不含插件命令）。 */
export function registerBuiltinCommands(
  registry: CommandRegistry,
  shapeCatalog: ShapeCatalog,
): void {
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
}
