import type { CommandError } from "../protocol/CommandError";
import type { CommandErrorCode } from "../protocol/CommandErrorCode";
import type { EditableAttribute } from "../protocol/EditableAttribute";
import type { Shape } from "../protocol/shapes/Shape";
import { ShapeError } from "../protocol/shapes/ShapeError";
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
import type { CommandParseResult } from "./CommandParseResult";

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
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      return { type: "empty" };
    }

    const tokens = CommandLineParser.tokenize(trimmed);

    if (CommandLineParser.isCommandError(tokens)) {
      return CommandLineParser.errorResult(tokens);
    }

    return this.parseTokens(tokens);
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
        return CommandLineParser.failure("invalid-command", `unknown command: ${tokens[0]}`);
    }
  }

  private static parseInit(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: new InitCommand() };
    }

    if (tokens.length !== 3) {
      return CommandLineParser.invalidArguments("init [width height]");
    }

    const dimensions = CommandLineParser.parseNumbers(tokens, 1, 2);

    if (CommandLineParser.isCommandError(dimensions)) {
      return CommandLineParser.errorResult(dimensions);
    }

    return {
      type: "command",
      command: new InitCommand(dimensions[0], dimensions[1]),
    };
  }

  private static parseRead(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("read <file.svg>");
    }

    const path = CommandLineParser.nonEmptyToken(tokens[1], "file path");

    if (CommandLineParser.isCommandError(path)) {
      return CommandLineParser.errorResult(path);
    }

    return { type: "command", command: new ReadCommand(path) };
  }

  private static parseSave(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: new SaveCommand() };
    }

    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("save [file.svg]");
    }

    const path = CommandLineParser.nonEmptyToken(tokens[1], "file path");

    if (CommandLineParser.isCommandError(path)) {
      return CommandLineParser.errorResult(path);
    }

    return { type: "command", command: new SaveCommand(path) };
  }

  private static parseCanvas(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: new CanvasCommand() };
    }

    if (tokens.length !== 3) {
      return CommandLineParser.invalidArguments("canvas [width height]");
    }

    const dimensions = CommandLineParser.parseNumbers(tokens, 1, 2);

    if (CommandLineParser.isCommandError(dimensions)) {
      return CommandLineParser.errorResult(dimensions);
    }

    return {
      type: "command",
      command: new CanvasCommand(dimensions[0], dimensions[1]),
    };
  }

  private parseCreate(tokens: string[]): CommandParseResult {
    if (tokens.length < 3) {
      return CommandLineParser.invalidArguments(
        "create <type> <id> [params...] [in <containerId>]",
      );
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[2], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    const parsedArguments = this.parseCreateArguments(tokens);

    if (CommandLineParser.isCommandError(parsedArguments)) {
      return CommandLineParser.errorResult(parsedArguments);
    }

    try {
      const shape = this.shapeFactory.create(
        tokens[1],
        shapeId,
        parsedArguments.arguments,
      );
      return this.createResult(shape, parsedArguments.parentId);
    } catch (error: unknown) {
      if (error instanceof ShapeError) {
        return CommandLineParser.failure(error.getCode(), error.message);
      }

      throw error;
    }
  }

  private parseCreateArguments(
    tokens: string[],
  ): { arguments: readonly string[]; parentId?: string } | CommandError {
    const parentKeywordIndex = tokens.length - 2;

    if (tokens[parentKeywordIndex] !== "in") {
      return { arguments: tokens.slice(3) };
    }

    const parentId = CommandLineParser.nonEmptyToken(
      tokens[parentKeywordIndex + 1],
      "container id",
    );

    if (CommandLineParser.isCommandError(parentId)) {
      return parentId;
    }

    return {
      arguments: tokens.slice(3, parentKeywordIndex),
      parentId,
    };
  }

  private createResult(shape: Shape, parentId?: string): CommandParseResult {
    return { type: "command", command: new CreateCommand(shape, parentId) };
  }

  private static parseDelete(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("delete <id>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return { type: "command", command: new DeleteCommand(shapeId) };
  }

  private static parseMove(tokens: string[]): CommandParseResult {
    if (tokens.length !== 4) {
      return CommandLineParser.invalidArguments("move <id> <dx> <dy>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    const numbers = CommandLineParser.parseNumbers(tokens, 2, 2);

    if (CommandLineParser.isCommandError(numbers)) {
      return CommandLineParser.errorResult(numbers);
    }

    return {
      type: "command",
      command: new MoveCommand(shapeId, numbers[0], numbers[1]),
    };
  }

  private static parseScale(tokens: string[]): CommandParseResult {
    if (tokens.length !== 3) {
      return CommandLineParser.invalidArguments("scale <id> <factor>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    const factor = CommandLineParser.parseNumber(tokens[2]);

    if (CommandLineParser.isCommandError(factor)) {
      return CommandLineParser.errorResult(factor);
    }

    return { type: "command", command: new ScaleCommand(shapeId, factor) };
  }

  private static parseSet(tokens: string[]): CommandParseResult {
    if (tokens.length !== 4) {
      return CommandLineParser.invalidArguments("set <id> <attribute> <value>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    if (!CommandLineParser.editableAttributes.has(tokens[2] as EditableAttribute)) {
      return CommandLineParser.failure(
        "unknown-attribute",
        `unknown attribute: ${tokens[2]}`,
      );
    }

    const attribute = tokens[2] as EditableAttribute;
    let value: string | number = tokens[3];

    if (CommandLineParser.numericAttributes.has(attribute)) {
      const parsedValue = CommandLineParser.parseNumber(tokens[3]);

      if (CommandLineParser.isCommandError(parsedValue)) {
        return CommandLineParser.errorResult(parsedValue);
      }

      value = parsedValue;
    }

    return {
      type: "command",
      command: new SetCommand(shapeId, attribute, value),
    };
  }

  private static parseGroup(tokens: string[]): CommandParseResult {
    if (tokens.length < 4) {
      return CommandLineParser.invalidArguments("group <newGid> <id1> <id2>...");
    }

    const containerId = CommandLineParser.nonEmptyToken(tokens[1], "container id");

    if (CommandLineParser.isCommandError(containerId)) {
      return CommandLineParser.errorResult(containerId);
    }

    const memberIds: string[] = [];

    for (const token of tokens.slice(2)) {
      const memberId = CommandLineParser.nonEmptyToken(token, "member id");

      if (CommandLineParser.isCommandError(memberId)) {
        return CommandLineParser.errorResult(memberId);
      }

      memberIds.push(memberId);
    }

    return {
      type: "command",
      command: new GroupCommand(containerId, memberIds),
    };
  }

  private static parseUngroup(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("ungroup <gid>");
    }

    const containerId = CommandLineParser.nonEmptyToken(tokens[1], "container id");

    if (CommandLineParser.isCommandError(containerId)) {
      return CommandLineParser.errorResult(containerId);
    }

    return { type: "command", command: new UngroupCommand(containerId) };
  }

  private static parseAddTo(tokens: string[]): CommandParseResult {
    if (tokens.length !== 3) {
      return CommandLineParser.invalidArguments("addto <gid> <id>");
    }

    const containerId = CommandLineParser.nonEmptyToken(tokens[1], "container id");

    if (CommandLineParser.isCommandError(containerId)) {
      return CommandLineParser.errorResult(containerId);
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[2], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return {
      type: "command",
      command: new AddToCommand(containerId, shapeId),
    };
  }

  private static parseReorder(
    tokens: string[],
    position: "front" | "back",
  ): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments(`${tokens[0]} <id>`);
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return {
      type: "command",
      command: new ReorderCommand(shapeId, position),
    };
  }

  private static parseTree(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: new TreeCommand() };
    }

    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("tree [id]");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return { type: "command", command: new TreeCommand(shapeId) };
  }

  private static parseShow(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("show <id>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return { type: "command", command: new ShowCommand(shapeId) };
  }

  private static parseNoArgumentCommand(tokens: string[]): CommandParseResult {
    if (tokens.length !== 1) {
      return CommandLineParser.invalidArguments(tokens[0]);
    }

    switch (tokens[0]) {
      case "help":
        return { type: "command", command: new HelpCommand() };
      case "undo":
        return { type: "command", command: new UndoCommand() };
      case "redo":
        return { type: "command", command: new RedoCommand() };
      case "exit":
        return { type: "command", command: new ExitCommand() };
      default:
        return CommandLineParser.failure("invalid-command", `unknown command: ${tokens[0]}`);
    }
  }

  private static parseNumbers(
    tokens: string[],
    startIndex: number,
    count: number,
  ): number[] | CommandError {
    const values: number[] = [];

    for (let index = 0; index < count; index += 1) {
      const token = tokens[startIndex + index];

      if (token === undefined) {
        return {
          code: "invalid-argument",
          message: `missing numeric argument at position ${startIndex + index + 1}`,
        };
      }

      const value = CommandLineParser.parseNumber(token);

      if (CommandLineParser.isCommandError(value)) {
        return value;
      }

      values.push(value);
    }

    return values;
  }

  private static parseNumber(token: string): number | CommandError {
    if (token.trim().length === 0) {
      return { code: "invalid-number", message: "empty numeric value" };
    }

    const value = Number(token);

    if (!Number.isFinite(value)) {
      return { code: "invalid-number", message: `invalid number: ${token}` };
    }

    return value;
  }

  private static nonEmptyToken(token: string | undefined, label: string): string | CommandError {
    if (token === undefined || token.trim().length === 0) {
      return { code: "invalid-argument", message: `missing ${label}` };
    }

    return token;
  }

  private static invalidArguments(usage: string): CommandParseResult {
    return CommandLineParser.failure(
      "invalid-argument",
      `invalid arguments; usage: ${usage}`,
    );
  }

  private static failure(code: CommandErrorCode, message: string): CommandParseResult {
    return { type: "error", error: { code, message } };
  }

  private static errorResult(error: CommandError): CommandParseResult {
    return { type: "error", error };
  }

  private static isCommandError(value: unknown): value is CommandError {
    return typeof value === "object" && value !== null && "code" in value;
  }

  private static tokenize(input: string): string[] | CommandError {
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
      return { code: "invalid-argument", message: "unterminated quoted string" };
    }

    if (tokenStarted) {
      tokens.push(current);
    }

    return tokens;
  }
}
