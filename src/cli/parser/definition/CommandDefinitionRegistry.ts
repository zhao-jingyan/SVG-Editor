import type { Command } from "../../../protocol/Command";
import type { ShapeFactory } from "../../../protocol/shapes/ShapeFactory";
import type { CommandArguments } from "../syntax/CommandArguments";
import type { CommandDefinition } from "./CommandDefinition";
import { DocumentCommandParser } from "../commands/document/DocumentCommandParser";
import { CreateCommandParser } from "../commands/shape/CreateCommandParser";
import { ShapeCommandParser } from "../commands/shape/ShapeCommandParser";
import { ViewCommandParser } from "../commands/view/ViewCommandParser";

/**
 * 集中维护命令名与参数构造器的唯一映射。
 */
export class CommandDefinitionRegistry {
  private readonly definitions = new Map<string, CommandDefinition>();

  public constructor(shapeFactory: ShapeFactory) {
    const documentParser = new DocumentCommandParser();
    const createParser = new CreateCommandParser(shapeFactory);
    const shapeParser = new ShapeCommandParser();
    const viewParser = new ViewCommandParser();

    this.register("init", "init [width height]", (args) =>
      documentParser.parseInit(args),
    );
    this.register("read", "read <file.svg>", (args) =>
      documentParser.parseRead(args),
    );
    this.register("save", "save [file.svg]", (args) =>
      documentParser.parseSave(args),
    );
    this.register("canvas", "canvas [width height]", (args) =>
      documentParser.parseCanvas(args),
    );
    this.register(
      "create",
      "create <type> <id> [params...] [in <containerId>]",
      (args) => createParser.parse(args),
    );
    this.register("delete", "delete <id>", (args) =>
      shapeParser.parseDelete(args),
    );
    this.register("move", "move <id> <dx> <dy>", (args) =>
      shapeParser.parseMove(args),
    );
    this.register("scale", "scale <id> <factor>", (args) =>
      shapeParser.parseScale(args),
    );
    this.register("set", "set <id> <attribute> <value>", (args) =>
      shapeParser.parseSet(args),
    );
    this.register("group", "group <newGid> <id1> <id2>...", (args) =>
      shapeParser.parseGroup(args),
    );
    this.register("ungroup", "ungroup <gid>", (args) =>
      shapeParser.parseUngroup(args),
    );
    this.register("addto", "addto <gid> <id>", (args) =>
      shapeParser.parseAddTo(args),
    );
    this.register("front", "front <id>", (args) =>
      shapeParser.parseReorder(args, "front"),
    );
    this.register("back", "back <id>", (args) =>
      shapeParser.parseReorder(args, "back"),
    );
    this.register("tree", "tree [id]", (args) =>
      viewParser.parseTree(args),
    );
    this.register("show", "show <id>", (args) =>
      viewParser.parseShow(args),
    );
    this.register("help", "help", (args) =>
      viewParser.parseHelp(args),
    );
    this.register("undo", "undo", (args) =>
      viewParser.parseUndo(args),
    );
    this.register("redo", "redo", (args) =>
      viewParser.parseRedo(args),
    );
    this.register("exit", "exit", (args) =>
      viewParser.parseExit(args),
    );
  }

  public find(commandName: string): CommandDefinition | undefined {
    return this.definitions.get(commandName);
  }

  private register(
    commandName: string,
    usage: string,
    parse: (args: CommandArguments) => Command,
  ): void {
    this.definitions.set(commandName, { usage, parse });
  }
}
