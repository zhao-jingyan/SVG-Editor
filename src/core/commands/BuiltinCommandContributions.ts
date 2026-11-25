import { CommandContribution } from "../../protocol/commands/_common/contribution/CommandContribution";
import type { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { AddToCommandContribution } from "../../protocol/commands/builtin/AddToCommand/AddToCommandContribution";
import { BackCommandContribution } from "../../protocol/commands/builtin/ReorderCommand/BackCommandContribution";
import { CanvasCommandContribution } from "../../protocol/commands/builtin/CanvasCommand/CanvasCommandContribution";
import { CreateCommandContribution } from "../../protocol/commands/builtin/CreateCommand/CreateCommandContribution";
import { DeleteCommandContribution } from "../../protocol/commands/builtin/DeleteCommand/DeleteCommandContribution";
import { ExitCommandContribution } from "../../protocol/commands/builtin/ExitCommand/ExitCommandContribution";
import { FrontCommandContribution } from "../../protocol/commands/builtin/ReorderCommand/FrontCommandContribution";
import { GroupCommandContribution } from "../../protocol/commands/builtin/GroupCommand/GroupCommandContribution";
import { HelpCommandContribution } from "../../protocol/commands/builtin/HelpCommand/HelpCommandContribution";
import { InitCommandContribution } from "../../protocol/commands/builtin/InitCommand/InitCommandContribution";
import { MoveCommandContribution } from "../../protocol/commands/builtin/MoveCommand/MoveCommandContribution";
import { ReadCommandContribution } from "../../protocol/commands/builtin/ReadCommand/ReadCommandContribution";
import { RedoCommandContribution } from "../../protocol/commands/builtin/RedoCommand/RedoCommandContribution";
import { SaveCommandContribution } from "../../protocol/commands/builtin/SaveCommand/SaveCommandContribution";
import { ScaleCommandContribution } from "../../protocol/commands/builtin/ScaleCommand/ScaleCommandContribution";
import { SetCommandContribution } from "../../protocol/commands/builtin/SetCommand/SetCommandContribution";
import { ShowCommandContribution } from "../../protocol/commands/builtin/ShowCommand/ShowCommandContribution";
import { TreeCommandContribution } from "../../protocol/commands/builtin/TreeCommand/TreeCommandContribution";
import { UndoCommandContribution } from "../../protocol/commands/builtin/UndoCommand/UndoCommandContribution";
import { UngroupCommandContribution } from "../../protocol/commands/builtin/UngroupCommand/UngroupCommandContribution";

/**
 * 按 Phase 1 help 顺序组装全部内置命令贡献。
 */
export class BuiltinCommandContributions {
  public constructor(private readonly shapeFactory: ShapeFactory) {}

  public create(): readonly CommandContribution[] {
    return [
      InitCommandContribution.create(),
      ReadCommandContribution.create(),
      SaveCommandContribution.create(),
      CanvasCommandContribution.create(),
      CreateCommandContribution.create(this.shapeFactory),
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
    ];
  }
}
