import { CanvasCommand } from "../../protocol/commands/doc/CanvasCommand";
import { InitCommand } from "../../protocol/commands/doc/InitCommand";
import { ReadCommand } from "../../protocol/commands/doc/ReadCommand";
import { SaveCommand } from "../../protocol/commands/doc/SaveCommand";
import { RedoCommand } from "../../protocol/commands/history/RedoCommand";
import { UndoCommand } from "../../protocol/commands/history/UndoCommand";
import { ExitCommand } from "../../protocol/commands/session/ExitCommand";
import { AddToCommand } from "../../protocol/commands/shape/AddToCommand";
import { DeleteCommand } from "../../protocol/commands/shape/DeleteCommand";
import { GroupCommand } from "../../protocol/commands/shape/GroupCommand";
import { MoveCommand } from "../../protocol/commands/shape/MoveCommand";
import { ReorderCommand } from "../../protocol/commands/shape/ReorderCommand";
import { ScaleCommand } from "../../protocol/commands/shape/ScaleCommand";
import { UngroupCommand } from "../../protocol/commands/shape/UngroupCommand";
import { HelpCommand } from "../../protocol/commands/view/HelpCommand";
import { ShowCommand } from "../../protocol/commands/view/ShowCommand";
import { TreeCommand } from "../../protocol/commands/view/TreeCommand";
import { CommandContribution } from "../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../protocol/contribution/CommandHelp";
import type { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { CreateCommandParser } from "./parsers/CreateCommandParser";
import { ShapeCommandParser } from "./parsers/ShapeCommandParser";

/**
 * 集中创建 Phase 1 全部内置命令贡献对象。
 */
export class BuiltinCommandContributions {
  public constructor(private readonly shapeFactory: ShapeFactory) {}

  public create(): readonly CommandContribution[] {
    const createParser = new CreateCommandParser(this.shapeFactory);
    const shapeParser = new ShapeCommandParser();

    return [
      new CommandContribution(
        "init",
        "init [width height]",
        new CommandHelp(
          "init [width height]",
          "create a new canvas (default 800x600)",
        ),
        (parameters) => {
          if (parameters.hasLength(0)) {
            return new InitCommand();
          }

          parameters.expectLength(2);
          const dimensions = parameters.numbers(0, 2);
          return new InitCommand(dimensions[0], dimensions[1]);
        },
      ),
      new CommandContribution(
        "read",
        "read <file.svg>",
        new CommandHelp("read <file.svg>", "read an SVG file"),
        (parameters) => {
          parameters.expectLength(1);
          return new ReadCommand(parameters.text(0, "file path"));
        },
      ),
      new CommandContribution(
        "save",
        "save [file.svg]",
        new CommandHelp("save [file.svg]", "save the current document"),
        (parameters) => {
          if (parameters.hasLength(0)) {
            return new SaveCommand();
          }

          parameters.expectLength(1);
          return new SaveCommand(parameters.text(0, "file path"));
        },
      ),
      new CommandContribution(
        "canvas",
        "canvas [width height]",
        new CommandHelp(
          "canvas [width height]",
          "show or resize the canvas",
        ),
        (parameters) => {
          if (parameters.hasLength(0)) {
            return new CanvasCommand();
          }

          parameters.expectLength(2);
          const dimensions = parameters.numbers(0, 2);
          return new CanvasCommand(dimensions[0], dimensions[1]);
        },
      ),
      new CommandContribution(
        "create",
        "create <type> <id> [params...] [in <containerId>]",
        new CommandHelp(
          "create <type> <id> [params...]",
          "create a shape",
        ),
        (parameters) => createParser.parse(parameters),
      ),
      new CommandContribution(
        "delete",
        "delete <id>",
        new CommandHelp("delete <id>", "delete a shape and its subtree"),
        (parameters) => {
          parameters.expectLength(1);
          return new DeleteCommand(parameters.text(0, "shape id"));
        },
      ),
      new CommandContribution(
        "move",
        "move <id> <dx> <dy>",
        new CommandHelp("move <id> <dx> <dy>", "move a shape"),
        (parameters) => {
          parameters.expectLength(3);
          const shapeId = parameters.text(0, "shape id");
          const numbers = parameters.numbers(1, 2);
          return new MoveCommand(shapeId, numbers[0], numbers[1]);
        },
      ),
      new CommandContribution(
        "scale",
        "scale <id> <factor>",
        new CommandHelp("scale <id> <factor>", "scale a shape"),
        (parameters) => {
          parameters.expectLength(2);
          return new ScaleCommand(
            parameters.text(0, "shape id"),
            parameters.number(1),
          );
        },
      ),
      new CommandContribution(
        "set",
        "set <id> <attribute> <value>",
        new CommandHelp(
          "set <id> <attribute> <value>",
          "set a shape attribute",
        ),
        (parameters) => shapeParser.parseSet(parameters),
      ),
      new CommandContribution(
        "group",
        "group <newGid> <id1> <id2>...",
        new CommandHelp(
          "group <newGid> <id1> <id2>...",
          "group existing shapes",
        ),
        (parameters) => {
          parameters.expectMinimumLength(3);
          const containerId = parameters.text(0, "container id");
          const memberIds: string[] = [];

          for (let index = 1; index < parameters.length; index += 1) {
            memberIds.push(parameters.text(index, "member id"));
          }

          return new GroupCommand(containerId, memberIds);
        },
      ),
      new CommandContribution(
        "ungroup",
        "ungroup <gid>",
        new CommandHelp("ungroup <gid>", "ungroup a container"),
        (parameters) => {
          parameters.expectLength(1);
          return new UngroupCommand(parameters.text(0, "container id"));
        },
      ),
      new CommandContribution(
        "addto",
        "addto <gid> <id>",
        new CommandHelp("addto <gid> <id>", "move a shape into a container"),
        (parameters) => {
          parameters.expectLength(2);
          return new AddToCommand(
            parameters.text(0, "container id"),
            parameters.text(1, "shape id"),
          );
        },
      ),
      new CommandContribution(
        "front",
        "front <id>",
        new CommandHelp("front <id> | back <id>", "change z-order"),
        (parameters) => {
          parameters.expectLength(1);
          return new ReorderCommand(
            parameters.text(0, "shape id"),
            "front",
          );
        },
      ),
      new CommandContribution(
        "back",
        "back <id>",
        undefined,
        (parameters) => {
          parameters.expectLength(1);
          return new ReorderCommand(
            parameters.text(0, "shape id"),
            "back",
          );
        },
      ),
      new CommandContribution(
        "tree",
        "tree [id]",
        new CommandHelp("tree [id]", "show the shape tree"),
        (parameters) => {
          if (parameters.hasLength(0)) {
            return new TreeCommand();
          }

          parameters.expectLength(1);
          return new TreeCommand(parameters.text(0, "shape id"));
        },
      ),
      new CommandContribution(
        "show",
        "show <id>",
        new CommandHelp("show <id>", "show shape attributes"),
        (parameters) => {
          parameters.expectLength(1);
          return new ShowCommand(parameters.text(0, "shape id"));
        },
      ),
      new CommandContribution(
        "undo",
        "undo",
        new CommandHelp("undo | redo", "undo or redo an edit"),
        (parameters) => {
          parameters.expectLength(0);
          return new UndoCommand();
        },
      ),
      new CommandContribution(
        "redo",
        "redo",
        undefined,
        (parameters) => {
          parameters.expectLength(0);
          return new RedoCommand();
        },
      ),
      new CommandContribution(
        "help",
        "help",
        new CommandHelp("help", "show this help"),
        (parameters) => {
          parameters.expectLength(0);
          return new HelpCommand();
        },
      ),
      new CommandContribution(
        "exit",
        "exit",
        new CommandHelp("exit", "leave the editor"),
        (parameters) => {
          parameters.expectLength(0);
          return new ExitCommand();
        },
      ),
    ];
  }
}
