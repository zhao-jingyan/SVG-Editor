import type { Command } from "../../protocol/commands/Command";
import { CommandHelp } from "../../protocol/plugins/CommandHelp";
import type { PluginContext } from "../../protocol/plugins/PluginContext";
import { CommandRegistration } from "../../protocol/plugins/CommandRegistration";
import type { SvgPlugin } from "../../protocol/plugins/SvgPlugin";
import type { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { DocumentCommandParser } from "../parser/commands/CommandsParser/doc/DocumentCommandParser";
import { CreateCommandParser } from "../parser/commands/CommandsParser/shape/CreateCommandParser";
import { ShapeCommandParser } from "../parser/commands/CommandsParser/shape/ShapeCommandParser";
import { ViewCommandParser } from "../parser/commands/CommandsParser/view/ViewCommandParser";
import { CommandArguments } from "../parser/syntax/CommandArguments";

export class BuiltinCommandPlugin implements SvgPlugin {
  public readonly name = "@svg-editor/builtin-commands";

  private readonly documentParser = new DocumentCommandParser();
  private readonly createParser: CreateCommandParser;
  private readonly shapeParser = new ShapeCommandParser();
  private readonly viewParser = new ViewCommandParser();

  public constructor(shapeFactory: ShapeFactory) {
    this.createParser = new CreateCommandParser(shapeFactory);
  }

  public activate(context: PluginContext): void {
    this.register(context, "init", "init [width height]", "create a new canvas (default 800x600)", (args) =>
      this.documentParser.parseInit(args),
    );
    this.register(context, "read", "read <file.svg>", "read an SVG file", (args) =>
      this.documentParser.parseRead(args),
    );
    this.register(context, "save", "save [file.svg]", "save the current document", (args) =>
      this.documentParser.parseSave(args),
    );
    this.register(context, "canvas", "canvas [width height]", "show or resize the canvas", (args) =>
      this.documentParser.parseCanvas(args),
    );
    this.registerWithHelp(
      context,
      "create",
      "create <type> <id> [params...] [in <containerId>]",
      "create <type> <id> [params...]",
      "create a shape",
      (args) => this.createParser.parse(args),
    );
    this.register(context, "delete", "delete <id>", "delete a shape and its subtree", (args) =>
      this.shapeParser.parseDelete(args),
    );
    this.register(context, "move", "move <id> <dx> <dy>", "move a shape", (args) =>
      this.shapeParser.parseMove(args),
    );
    this.register(context, "scale", "scale <id> <factor>", "scale a shape", (args) =>
      this.shapeParser.parseScale(args),
    );
    this.register(context, "set", "set <id> <attribute> <value>", "set a shape attribute", (args) =>
      this.shapeParser.parseSet(args),
    );
    this.register(context, "group", "group <newGid> <id1> <id2>...", "group existing shapes", (args) =>
      this.shapeParser.parseGroup(args),
    );
    this.register(context, "ungroup", "ungroup <gid>", "ungroup a container", (args) =>
      this.shapeParser.parseUngroup(args),
    );
    this.register(context, "addto", "addto <gid> <id>", "move a shape into a container", (args) =>
      this.shapeParser.parseAddTo(args),
    );
    this.registerWithHelp(
      context,
      "front",
      "front <id>",
      "front <id> | back <id>",
      "change z-order",
      (args) => this.shapeParser.parseReorder(args, "front"),
    );
    this.registerWithoutHelp(context, "back", "back <id>", (args) =>
      this.shapeParser.parseReorder(args, "back"),
    );
    this.register(context, "tree", "tree [id]", "show the shape tree", (args) =>
      this.viewParser.parseTree(args),
    );
    this.register(context, "show", "show <id>", "show shape attributes", (args) =>
      this.viewParser.parseShow(args),
    );
    this.registerWithHelp(
      context,
      "undo",
      "undo",
      "undo | redo",
      "undo or redo an edit",
      (args) => this.viewParser.parseUndo(args),
    );
    this.registerWithoutHelp(context, "redo", "redo", (args) =>
      this.viewParser.parseRedo(args),
    );
    this.register(context, "help", "help", "show this help", (args) =>
      this.viewParser.parseHelp(args),
    );
    this.register(context, "exit", "exit", "leave the editor", (args) =>
      this.viewParser.parseExit(args),
    );
  }

  private register(
    context: PluginContext,
    name: string,
    usage: string,
    description: string,
    parse: (args: CommandArguments) => Command,
  ): void {
    this.registerWithHelp(
      context,
      name,
      usage,
      usage,
      description,
      parse,
    );
  }

  private registerWithHelp(
    context: PluginContext,
    name: string,
    usage: string,
    helpUsage: string,
    description: string,
    parse: (args: CommandArguments) => Command,
  ): void {
    this.registerRegistration(
      context,
      name,
      usage,
      new CommandHelp(helpUsage, description),
      parse,
    );
  }

  private registerWithoutHelp(
    context: PluginContext,
    name: string,
    usage: string,
    parse: (args: CommandArguments) => Command,
  ): void {
    this.registerRegistration(context, name, usage, undefined, parse);
  }

  private registerRegistration(
    context: PluginContext,
    name: string,
    usage: string,
    help: CommandHelp | undefined,
    parse: (args: CommandArguments) => Command,
  ): void {
    context.commands.register(
      new CommandRegistration(
        name,
        usage,
        help,
        (tokens) => parse(new CommandArguments(tokens, usage)),
      ),
    );
  }
}
