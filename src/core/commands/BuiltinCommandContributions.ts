import { CommandContribution } from "../../protocol/contribution/CommandContribution";
import { CommandHelp } from "../../protocol/contribution/CommandHelp";
import type { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { CreateCommandParser } from "./parsers/CreateCommandParser";
import { DocumentCommandParser } from "./parsers/DocumentCommandParser";
import { ShapeCommandParser } from "./parsers/ShapeCommandParser";
import { ViewCommandParser } from "./parsers/ViewCommandParser";

/**
 * 集中创建 Phase 1 全部内置命令贡献对象。
 */
export class BuiltinCommandContributions {
  public constructor(private readonly shapeFactory: ShapeFactory) {}

  public create(): readonly CommandContribution[] {
    const documentParser = new DocumentCommandParser();
    const createParser = new CreateCommandParser(this.shapeFactory);
    const shapeParser = new ShapeCommandParser();
    const viewParser = new ViewCommandParser();

    return [
      new CommandContribution(
        "init",
        "init [width height]",
        new CommandHelp(
          "init [width height]",
          "create a new canvas (default 800x600)",
        ),
        (parameters) => documentParser.parseInit(parameters),
      ),
      new CommandContribution(
        "read",
        "read <file.svg>",
        new CommandHelp("read <file.svg>", "read an SVG file"),
        (parameters) => documentParser.parseRead(parameters),
      ),
      new CommandContribution(
        "save",
        "save [file.svg]",
        new CommandHelp("save [file.svg]", "save the current document"),
        (parameters) => documentParser.parseSave(parameters),
      ),
      new CommandContribution(
        "canvas",
        "canvas [width height]",
        new CommandHelp(
          "canvas [width height]",
          "show or resize the canvas",
        ),
        (parameters) => documentParser.parseCanvas(parameters),
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
        (parameters) => shapeParser.parseDelete(parameters),
      ),
      new CommandContribution(
        "move",
        "move <id> <dx> <dy>",
        new CommandHelp("move <id> <dx> <dy>", "move a shape"),
        (parameters) => shapeParser.parseMove(parameters),
      ),
      new CommandContribution(
        "scale",
        "scale <id> <factor>",
        new CommandHelp("scale <id> <factor>", "scale a shape"),
        (parameters) => shapeParser.parseScale(parameters),
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
        (parameters) => shapeParser.parseGroup(parameters),
      ),
      new CommandContribution(
        "ungroup",
        "ungroup <gid>",
        new CommandHelp("ungroup <gid>", "ungroup a container"),
        (parameters) => shapeParser.parseUngroup(parameters),
      ),
      new CommandContribution(
        "addto",
        "addto <gid> <id>",
        new CommandHelp("addto <gid> <id>", "move a shape into a container"),
        (parameters) => shapeParser.parseAddTo(parameters),
      ),
      new CommandContribution(
        "front",
        "front <id>",
        new CommandHelp("front <id> | back <id>", "change z-order"),
        (parameters) => shapeParser.parseReorder(parameters, "front"),
      ),
      new CommandContribution(
        "back",
        "back <id>",
        undefined,
        (parameters) => shapeParser.parseReorder(parameters, "back"),
      ),
      new CommandContribution(
        "tree",
        "tree [id]",
        new CommandHelp("tree [id]", "show the shape tree"),
        (parameters) => viewParser.parseTree(parameters),
      ),
      new CommandContribution(
        "show",
        "show <id>",
        new CommandHelp("show <id>", "show shape attributes"),
        (parameters) => viewParser.parseShow(parameters),
      ),
      new CommandContribution(
        "undo",
        "undo",
        new CommandHelp("undo | redo", "undo or redo an edit"),
        (parameters) => viewParser.parseUndo(parameters),
      ),
      new CommandContribution(
        "redo",
        "redo",
        undefined,
        (parameters) => viewParser.parseRedo(parameters),
      ),
      new CommandContribution(
        "help",
        "help",
        new CommandHelp("help", "show this help"),
        (parameters) => viewParser.parseHelp(parameters),
      ),
      new CommandContribution(
        "exit",
        "exit",
        new CommandHelp("exit", "leave the editor"),
        (parameters) => viewParser.parseExit(parameters),
      ),
    ];
  }
}
