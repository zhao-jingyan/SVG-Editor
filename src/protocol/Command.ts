import type { AddToCommand } from "./commands/AddToCommand";
import type { CanvasCommand } from "./commands/CanvasCommand";
import type { CreateCommand } from "./commands/CreateCommand";
import type { DeleteCommand } from "./commands/DeleteCommand";
import type { ExitCommand } from "./commands/ExitCommand";
import type { GroupCommand } from "./commands/GroupCommand";
import type { HelpCommand } from "./commands/HelpCommand";
import type { InitCommand } from "./commands/InitCommand";
import type { MoveCommand } from "./commands/MoveCommand";
import type { ReadCommand } from "./commands/ReadCommand";
import type { RedoCommand } from "./commands/RedoCommand";
import type { ReorderCommand } from "./commands/ReorderCommand";
import type { SaveCommand } from "./commands/SaveCommand";
import type { ScaleCommand } from "./commands/ScaleCommand";
import type { SetCommand } from "./commands/SetCommand";
import type { ShowCommand } from "./commands/ShowCommand";
import type { TreeCommand } from "./commands/TreeCommand";
import type { UndoCommand } from "./commands/UndoCommand";
import type { UngroupCommand } from "./commands/UngroupCommand";

export type Command =
  | InitCommand
  | ReadCommand
  | SaveCommand
  | CanvasCommand
  | CreateCommand
  | DeleteCommand
  | MoveCommand
  | ScaleCommand
  | SetCommand
  | GroupCommand
  | UngroupCommand
  | AddToCommand
  | ReorderCommand
  | TreeCommand
  | ShowCommand
  | HelpCommand
  | UndoCommand
  | RedoCommand
  | ExitCommand;
