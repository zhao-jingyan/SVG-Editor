import { CommandContribution } from "../../protocol/commands/_common/contribution/CommandContribution";
import type { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { AddToCommandContribution } from "../../protocol/commands/AddToCommand/AddToCommandContribution";
import { BackCommandContribution } from "../../protocol/commands/ReorderCommand/BackCommandContribution";
import { CanvasCommandContribution } from "../../protocol/commands/CanvasCommand/CanvasCommandContribution";
import { CreateCommandContribution } from "../../protocol/commands/CreateCommand/CreateCommandContribution";
import { DeleteCommandContribution } from "../../protocol/commands/DeleteCommand/DeleteCommandContribution";
import { ExitCommandContribution } from "../../protocol/commands/ExitCommand/ExitCommandContribution";
import { FrontCommandContribution } from "../../protocol/commands/ReorderCommand/FrontCommandContribution";
import { GroupCommandContribution } from "../../protocol/commands/GroupCommand/GroupCommandContribution";
import { HelpCommandContribution } from "../../protocol/commands/HelpCommand/HelpCommandContribution";
import { InitCommandContribution } from "../../protocol/commands/InitCommand/InitCommandContribution";
import { MoveCommandContribution } from "../../protocol/commands/MoveCommand/MoveCommandContribution";
import { ReadCommandContribution } from "../../protocol/commands/ReadCommand/ReadCommandContribution";
import { RedoCommandContribution } from "../../protocol/commands/RedoCommand/RedoCommandContribution";
import { SaveCommandContribution } from "../../protocol/commands/SaveCommand/SaveCommandContribution";
import { ScaleCommandContribution } from "../../protocol/commands/ScaleCommand/ScaleCommandContribution";
import { SetCommandContribution } from "../../protocol/commands/SetCommand/SetCommandContribution";
import { ShowCommandContribution } from "../../protocol/commands/ShowCommand/ShowCommandContribution";
import { TreeCommandContribution } from "../../protocol/commands/TreeCommand/TreeCommandContribution";
import { UndoCommandContribution } from "../../protocol/commands/UndoCommand/UndoCommandContribution";
import { UngroupCommandContribution } from "../../protocol/commands/UngroupCommand/UngroupCommandContribution";

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
