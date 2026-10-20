import { CommandErrorCode } from "../protocol/errors/CommandErrorCode";
import { CommandParseError } from "../protocol/errors/CommandParseError";
import { ProtocolError } from "../protocol/errors/ProtocolError";
import type { EditableAttribute } from "../protocol/EditableAttribute";
import type { Shape } from "../protocol/shapes/Shape";
import type { ShapeFactory } from "../protocol/shapes/ShapeFactory";
import { AddToCommand } from "../protocol/commands/AddToCommand";
import { CanvasCommand } from "../protocol/commands/CanvasCommand";
import { CreateCommand } from "../protocol/commands/CreateCommand";
import { DeleteCommand } from "../protocol/commands/DeleteCommand";
import { ExitCommand } from "../protocol/commands/ExitCommand";
import { GroupCommand } from "../protocol/commands/GroupCommand";
import { HelpCommand } from "../protocol/commands/HelpCommand";
import { InitCommand } from "../protocol/commands/InitCommand";
import { MoveCommand } from "../protocol/commands/MoveCommand";
import { ReadCommand } from "../protocol/commands/ReadCommand";
import { RedoCommand } from "../protocol/commands/RedoCommand";
import { ReorderCommand } from "../protocol/commands/ReorderCommand";
import { SaveCommand } from "../protocol/commands/SaveCommand";
import { ScaleCommand } from "../protocol/commands/ScaleCommand";
import { SetCommand } from "../protocol/commands/SetCommand";
import { ShowCommand } from "../protocol/commands/ShowCommand";
import { TreeCommand } from "../protocol/commands/TreeCommand";
import { UndoCommand } from "../protocol/commands/UndoCommand";
import { UngroupCommand } from "../protocol/commands/UngroupCommand";
import type { CommandParser } from "./CommandParser";
import { CommandParseEmptyResult } from "./results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "./results/CommandParseErrorResult";
import type { CommandParseResult } from "./results/CommandParseResult";
import { CommandParseSuccessResult } from "./results/CommandParseSuccessResult";

export class CommandLineParser implements CommandParser {
  private static readonly editableAttributes = new Set<EditableAttribute>([
    "fill",
    "stroke",
    "stroke-width",
    "x",
    "y",
    "width",
    "height",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x1",
    "y1",
    "x2",
    "y2",
    "text",
  ]);

  private static readonly numericAttributes = new Set<EditableAttribute>([
    "stroke-width",
    "x",
    "y",
    "width",
    "height",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x1",
    "y1",
    "x2",
    "y2",
  ]);

  public constructor(private readonly shapeFactory: ShapeFactory) {}

  public parse(line: string): CommandParseResult {
    try {
      const trimmed = line.trim();

      if (trimmed.length === 0 || trimmed.startsWith("#")) {
        return new CommandParseEmptyResult();
      }

      return this.parseTokens(CommandLineParser.tokenize(trimmed));
    } catch (error: unknown) {
      if (error instanceof ProtocolError) {
        return new CommandParseErrorResult(error);
      }

      throw error;
    }
  }

  private parseTokens(tokens: string[]): CommandParseResult {
    switch (tokens[0]) {
      case "init":
        return CommandLineParser.parseInit(tokens);
      case "read":
        return CommandLineParser.parseRead(tokens);
      case "save":
        return CommandLineParser.parseSave(tokens);
      case "canvas":
        return CommandLineParser.parseCanvas(tokens);
      case "create":
        return this.parseCreate(tokens);
      case "delete":
        return CommandLineParser.parseDelete(tokens);
      case "move":
        return CommandLineParser.parseMove(tokens);
      case "scale":
        return CommandLineParser.parseScale(tokens);
      case "set":
        return CommandLineParser.parseSet(tokens);
      case "group":
        return CommandLineParser.parseGroup(tokens);
      case "ungroup":
        return CommandLineParser.parseUngroup(tokens);
      case "addto":
        return CommandLineParser.parseAddTo(tokens);
      case "front":
        return CommandLineParser.parseReorder(tokens, "front");
      case "back":
        return CommandLineParser.parseReorder(tokens, "back");
      case "tree":
        return CommandLineParser.parseTree(tokens);
      case "show":
        return CommandLineParser.parseShow(tokens);
      case "help":
      case "undo":
      case "redo":
      case "exit":
        return CommandLineParser.parseNoArgumentCommand(tokens);
      default:
        throw new CommandParseError(
          CommandErrorCode.InvalidCommand,
          `unknown command: ${tokens[0]}`,
        );
    }
  }

  private static parseInit(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return new CommandParseSuccessResult(new InitCommand());
    }

    if (tokens.length !== 3) {
      CommandLineParser.invalidArguments("init [width height]");
    }

    const dimensions = CommandLineParser.parseNumbers(tokens, 1, 2);

    return new CommandParseSuccessResult(
      new InitCommand(dimensions[0], dimensions[1]),
    );
  }

  private static parseRead(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments("read <file.svg>");
    }

    return new CommandParseSuccessResult(
      new ReadCommand(CommandLineParser.nonEmptyToken(tokens[1], "file path")),
    );
  }

  private static parseSave(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return new CommandParseSuccessResult(new SaveCommand());
    }

    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments("save [file.svg]");
    }

    return new CommandParseSuccessResult(
      new SaveCommand(CommandLineParser.nonEmptyToken(tokens[1], "file path")),
    );
  }

  private static parseCanvas(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return new CommandParseSuccessResult(new CanvasCommand());
    }

    if (tokens.length !== 3) {
      CommandLineParser.invalidArguments("canvas [width height]");
    }

    const dimensions = CommandLineParser.parseNumbers(tokens, 1, 2);

    return new CommandParseSuccessResult(
      new CanvasCommand(dimensions[0], dimensions[1]),
    );
  }

  private parseCreate(tokens: string[]): CommandParseResult {
    if (tokens.length < 3) {
      CommandLineParser.invalidArguments(
        "create <type> <id> [params...] [in <containerId>]",
      );
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[2], "shape id");
    const parsedArguments = this.parseCreateArguments(tokens);
    const shape = this.shapeFactory.create(
      tokens[1],
      shapeId,
      parsedArguments.arguments,
    );

    return this.createResult(shape, parsedArguments.parentId);
  }

  private parseCreateArguments(
    tokens: string[],
  ): { arguments: readonly string[]; parentId?: string } {
    const parentKeywordIndex = tokens.length - 2;

    if (tokens[parentKeywordIndex] !== "in") {
      return { arguments: tokens.slice(3) };
    }

    const parentId = CommandLineParser.nonEmptyToken(
      tokens[parentKeywordIndex + 1],
      "container id",
    );

    return {
      arguments: tokens.slice(3, parentKeywordIndex),
      parentId,
    };
  }

  private createResult(shape: Shape, parentId?: string): CommandParseResult {
    return new CommandParseSuccessResult(new CreateCommand(shape, parentId));
  }

  private static parseDelete(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments("delete <id>");
    }

    return new CommandParseSuccessResult(
      new DeleteCommand(CommandLineParser.nonEmptyToken(tokens[1], "shape id")),
    );
  }

  private static parseMove(tokens: string[]): CommandParseResult {
    if (tokens.length !== 4) {
      CommandLineParser.invalidArguments("move <id> <dx> <dy>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");
    const numbers = CommandLineParser.parseNumbers(tokens, 2, 2);

    return new CommandParseSuccessResult(
      new MoveCommand(shapeId, numbers[0], numbers[1]),
    );
  }

  private static parseScale(tokens: string[]): CommandParseResult {
    if (tokens.length !== 3) {
      CommandLineParser.invalidArguments("scale <id> <factor>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");
    const factor = CommandLineParser.parseNumber(tokens[2]);

    return new CommandParseSuccessResult(new ScaleCommand(shapeId, factor));
  }

  private static parseSet(tokens: string[]): CommandParseResult {
    if (tokens.length !== 4) {
      CommandLineParser.invalidArguments("set <id> <attribute> <value>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (!CommandLineParser.editableAttributes.has(tokens[2] as EditableAttribute)) {
      throw new CommandParseError(
        CommandErrorCode.UnknownAttribute,
        `unknown attribute: ${tokens[2]}`,
      );
    }

    const attribute = tokens[2] as EditableAttribute;
    let value: string | number = tokens[3];

    if (CommandLineParser.numericAttributes.has(attribute)) {
      value = CommandLineParser.parseNumber(tokens[3]);
    }

    return new CommandParseSuccessResult(
      new SetCommand(shapeId, attribute, value),
    );
  }

  private static parseGroup(tokens: string[]): CommandParseResult {
    if (tokens.length < 4) {
      CommandLineParser.invalidArguments("group <newGid> <id1> <id2>...");
    }

    const containerId = CommandLineParser.nonEmptyToken(tokens[1], "container id");
    const memberIds: string[] = [];

    for (const token of tokens.slice(2)) {
      memberIds.push(CommandLineParser.nonEmptyToken(token, "member id"));
    }

    return new CommandParseSuccessResult(
      new GroupCommand(containerId, memberIds),
    );
  }

  private static parseUngroup(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments("ungroup <gid>");
    }

    return new CommandParseSuccessResult(
      new UngroupCommand(CommandLineParser.nonEmptyToken(tokens[1], "container id")),
    );
  }

  private static parseAddTo(tokens: string[]): CommandParseResult {
    if (tokens.length !== 3) {
      CommandLineParser.invalidArguments("addto <gid> <id>");
    }

    const containerId = CommandLineParser.nonEmptyToken(tokens[1], "container id");
    const shapeId = CommandLineParser.nonEmptyToken(tokens[2], "shape id");

    return new CommandParseSuccessResult(
      new AddToCommand(containerId, shapeId),
    );
  }

  private static parseReorder(
    tokens: string[],
    position: "front" | "back",
  ): CommandParseResult {
    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments(`${tokens[0]} <id>`);
    }

    return new CommandParseSuccessResult(
      new ReorderCommand(
        CommandLineParser.nonEmptyToken(tokens[1], "shape id"),
        position,
      ),
    );
  }

  private static parseTree(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return new CommandParseSuccessResult(new TreeCommand());
    }

    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments("tree [id]");
    }

    return new CommandParseSuccessResult(
      new TreeCommand(CommandLineParser.nonEmptyToken(tokens[1], "shape id")),
    );
  }

  private static parseShow(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      CommandLineParser.invalidArguments("show <id>");
    }

    return new CommandParseSuccessResult(
      new ShowCommand(CommandLineParser.nonEmptyToken(tokens[1], "shape id")),
    );
  }

  private static parseNoArgumentCommand(tokens: string[]): CommandParseResult {
    if (tokens.length !== 1) {
      CommandLineParser.invalidArguments(tokens[0]);
    }

    switch (tokens[0]) {
      case "help":
        return new CommandParseSuccessResult(new HelpCommand());
      case "undo":
        return new CommandParseSuccessResult(new UndoCommand());
      case "redo":
        return new CommandParseSuccessResult(new RedoCommand());
      case "exit":
        return new CommandParseSuccessResult(new ExitCommand());
      default:
        throw new CommandParseError(
          CommandErrorCode.InvalidCommand,
          `unknown command: ${tokens[0]}`,
        );
    }
  }

  private static parseNumbers(
    tokens: string[],
    startIndex: number,
    count: number,
  ): number[] {
    const values: number[] = [];

    for (let index = 0; index < count; index += 1) {
      const token = tokens[startIndex + index];

      if (token === undefined) {
        throw new CommandParseError(
          CommandErrorCode.InvalidArgument,
          `missing numeric argument at position ${startIndex + index + 1}`,
        );
      }

      values.push(CommandLineParser.parseNumber(token));
    }

    return values;
  }

  private static parseNumber(token: string): number {
    if (token.trim().length === 0) {
      throw new CommandParseError(
        CommandErrorCode.InvalidNumber,
        "empty numeric value",
      );
    }

    const value = Number(token);

    if (!Number.isFinite(value)) {
      throw new CommandParseError(
        CommandErrorCode.InvalidNumber,
        `invalid number: ${token}`,
      );
    }

    return value;
  }

  private static nonEmptyToken(token: string | undefined, label: string): string {
    if (token === undefined || token.trim().length === 0) {
      throw new CommandParseError(
        CommandErrorCode.InvalidArgument,
        `missing ${label}`,
      );
    }

    return token;
  }

  private static invalidArguments(usage: string): never {
    throw new CommandParseError(
      CommandErrorCode.InvalidArgument,
      `invalid arguments; usage: ${usage}`,
    );
  }

  private static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;
    let tokenStarted = false;

    for (const character of input) {
      if (character === '"') {
        inQuotes = !inQuotes;
        tokenStarted = true;
        continue;
      }

      if (!inQuotes && /\s/.test(character)) {
        if (tokenStarted) {
          tokens.push(current);
          current = "";
          tokenStarted = false;
        }
        continue;
      }

      current += character;
      tokenStarted = true;
    }

    if (inQuotes) {
      throw new CommandParseError(
        CommandErrorCode.InvalidArgument,
        "unterminated quoted string",
      );
    }

    if (tokenStarted) {
      tokens.push(current);
    }

    return tokens;
  }
}
