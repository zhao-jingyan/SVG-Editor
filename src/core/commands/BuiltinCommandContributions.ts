import { CommandContribution } from "../../protocol/contribution/CommandContribution";
import type { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { AddToCommandContribution } from "./contributions/AddToCommandContribution";
import { BackCommandContribution } from "./contributions/BackCommandContribution";
import { CanvasCommandContribution } from "./contributions/CanvasCommandContribution";
import { CreateCommandContribution } from "./contributions/CreateCommandContribution";
import { DeleteCommandContribution } from "./contributions/DeleteCommandContribution";
import { ExitCommandContribution } from "./contributions/ExitCommandContribution";
import { FrontCommandContribution } from "./contributions/FrontCommandContribution";
import { GroupCommandContribution } from "./contributions/GroupCommandContribution";
import { HelpCommandContribution } from "./contributions/HelpCommandContribution";
import { InitCommandContribution } from "./contributions/InitCommandContribution";
import { MoveCommandContribution } from "./contributions/MoveCommandContribution";
import { ReadCommandContribution } from "./contributions/ReadCommandContribution";
import { RedoCommandContribution } from "./contributions/RedoCommandContribution";
import { SaveCommandContribution } from "./contributions/SaveCommandContribution";
import { ScaleCommandContribution } from "./contributions/ScaleCommandContribution";
import { SetCommandContribution } from "./contributions/SetCommandContribution";
import { ShowCommandContribution } from "./contributions/ShowCommandContribution";
import { TreeCommandContribution } from "./contributions/TreeCommandContribution";
import { UndoCommandContribution } from "./contributions/UndoCommandContribution";
import { UngroupCommandContribution } from "./contributions/UngroupCommandContribution";

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
