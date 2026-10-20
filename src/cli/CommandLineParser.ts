import type { Command } from "../protocol/Command";
import type { CommandError } from "../protocol/CommandError";
import type { CommandErrorCode } from "../protocol/CommandErrorCode";
import type { EditableAttribute } from "../protocol/EditableAttribute";
import type {
  CircleShapeSpec,
  ContainerShapeSpec,
  EllipseShapeSpec,
  LineShapeSpec,
  RectShapeSpec,
  ShapeSpec,
  TextShapeSpec,
} from "../protocol/ShapeSpec";
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

  public parse(line: string): CommandParseResult {
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      return { type: "empty" };
    }

    const tokens = CommandLineParser.tokenize(trimmed);

    if (CommandLineParser.isCommandError(tokens)) {
      return CommandLineParser.errorResult(tokens);
    }

    return CommandLineParser.parseTokens(tokens);
  }

  private static parseTokens(tokens: string[]): CommandParseResult {
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
        return CommandLineParser.parseCreate(tokens);
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
      return { type: "command", command: { type: "init" } };
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
      command: { type: "init", width: dimensions[0], height: dimensions[1] },
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

    return { type: "command", command: { type: "read", path } };
  }

  private static parseSave(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: { type: "save" } };
    }

    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("save [file.svg]");
    }

    const path = CommandLineParser.nonEmptyToken(tokens[1], "file path");

    if (CommandLineParser.isCommandError(path)) {
      return CommandLineParser.errorResult(path);
    }

    return { type: "command", command: { type: "save", path } };
  }

  private static parseCanvas(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: { type: "canvas" } };
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
      command: { type: "canvas", width: dimensions[0], height: dimensions[1] },
    };
  }

  private static parseCreate(tokens: string[]): CommandParseResult {
    if (tokens.length < 3) {
      return CommandLineParser.invalidArguments(
        "create <type> <id> [params...] [in <containerId>]",
      );
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[2], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    switch (tokens[1]) {
      case "rect":
        return CommandLineParser.parseRect(tokens, shapeId);
      case "circle":
        return CommandLineParser.parseCircle(tokens, shapeId);
      case "ellipse":
        return CommandLineParser.parseEllipse(tokens, shapeId);
      case "line":
        return CommandLineParser.parseLine(tokens, shapeId);
      case "text":
        return CommandLineParser.parseText(tokens, shapeId);
      case "g":
        return CommandLineParser.parseContainer(tokens, shapeId);
      default:
        return CommandLineParser.failure(
          "unknown-shape-type",
          `unknown shape type: ${tokens[1]}`,
        );
    }
  }

  private static parseRect(tokens: string[], id: string): CommandParseResult {
    const numbers = CommandLineParser.parseNumbers(tokens, 3, 4);

    if (CommandLineParser.isCommandError(numbers)) {
      return CommandLineParser.errorResult(numbers);
    }

    const tail = CommandLineParser.parseCreateTail(tokens, 7, "fill");

    if (CommandLineParser.isCommandError(tail)) {
      return CommandLineParser.errorResult(tail);
    }

    const shape: RectShapeSpec = {
      type: "rect",
      id,
      x: numbers[0],
      y: numbers[1],
      width: numbers[2],
      height: numbers[3],
      ...(tail.style === undefined ? {} : { fill: tail.style }),
    };

    return CommandLineParser.createResult(shape, tail.parentId);
  }

  private static parseCircle(tokens: string[], id: string): CommandParseResult {
    const numbers = CommandLineParser.parseNumbers(tokens, 3, 3);

    if (CommandLineParser.isCommandError(numbers)) {
      return CommandLineParser.errorResult(numbers);
    }

    const tail = CommandLineParser.parseCreateTail(tokens, 6, "fill");

    if (CommandLineParser.isCommandError(tail)) {
      return CommandLineParser.errorResult(tail);
    }

    const shape: CircleShapeSpec = {
      type: "circle",
      id,
      cx: numbers[0],
      cy: numbers[1],
      r: numbers[2],
      ...(tail.style === undefined ? {} : { fill: tail.style }),
    };

    return CommandLineParser.createResult(shape, tail.parentId);
  }

  private static parseEllipse(tokens: string[], id: string): CommandParseResult {
    const numbers = CommandLineParser.parseNumbers(tokens, 3, 4);

    if (CommandLineParser.isCommandError(numbers)) {
      return CommandLineParser.errorResult(numbers);
    }

    const tail = CommandLineParser.parseCreateTail(tokens, 7, "fill");

    if (CommandLineParser.isCommandError(tail)) {
      return CommandLineParser.errorResult(tail);
    }

    const shape: EllipseShapeSpec = {
      type: "ellipse",
      id,
      cx: numbers[0],
      cy: numbers[1],
      rx: numbers[2],
      ry: numbers[3],
      ...(tail.style === undefined ? {} : { fill: tail.style }),
    };

    return CommandLineParser.createResult(shape, tail.parentId);
  }

  private static parseLine(tokens: string[], id: string): CommandParseResult {
    const numbers = CommandLineParser.parseNumbers(tokens, 3, 4);

    if (CommandLineParser.isCommandError(numbers)) {
      return CommandLineParser.errorResult(numbers);
    }

    const tail = CommandLineParser.parseCreateTail(tokens, 7, "stroke");

    if (CommandLineParser.isCommandError(tail)) {
      return CommandLineParser.errorResult(tail);
    }

    const shape: LineShapeSpec = {
      type: "line",
      id,
      x1: numbers[0],
      y1: numbers[1],
      x2: numbers[2],
      y2: numbers[3],
      ...(tail.style === undefined ? {} : { stroke: tail.style }),
    };

    return CommandLineParser.createResult(shape, tail.parentId);
  }

  private static parseText(tokens: string[], id: string): CommandParseResult {
    const numbers = CommandLineParser.parseNumbers(tokens, 3, 2);

    if (CommandLineParser.isCommandError(numbers)) {
      return CommandLineParser.errorResult(numbers);
    }

    if (tokens[5] === undefined) {
      return CommandLineParser.invalidArguments(
        'create text <id> <x> <y> "content" [in <containerId>]',
      );
    }

    const parent = CommandLineParser.parseParent(tokens, 6);

    if (CommandLineParser.isCommandError(parent)) {
      return CommandLineParser.errorResult(parent);
    }

    const shape: TextShapeSpec = {
      type: "text",
      id,
      x: numbers[0],
      y: numbers[1],
      content: tokens[5],
    };

    return CommandLineParser.createResult(shape, parent.parentId);
  }

  private static parseContainer(tokens: string[], id: string): CommandParseResult {
    const parent = CommandLineParser.parseParent(tokens, 3);

    if (CommandLineParser.isCommandError(parent)) {
      return CommandLineParser.errorResult(parent);
    }

    const shape: ContainerShapeSpec = { type: "g", id };
    return CommandLineParser.createResult(shape, parent.parentId);
  }

  private static parseCreateTail(
    tokens: string[],
    styleIndex: number,
    styleName: "fill" | "stroke",
  ): { style?: string; parentId?: string } | CommandError {
    let nextIndex = styleIndex;
    let style: string | undefined;

    if (tokens[nextIndex] !== undefined && tokens[nextIndex] !== "in") {
      const parsedStyle = CommandLineParser.nonEmptyToken(tokens[nextIndex], styleName);

      if (CommandLineParser.isCommandError(parsedStyle)) {
        return parsedStyle;
      }

      style = parsedStyle;
      nextIndex += 1;
    }

    const parent = CommandLineParser.parseParent(tokens, nextIndex);

    if (CommandLineParser.isCommandError(parent)) {
      return parent;
    }

    return {
      ...(style === undefined ? {} : { style }),
      ...(parent.parentId === undefined ? {} : { parentId: parent.parentId }),
    };
  }

  private static parseParent(
    tokens: string[],
    startIndex: number,
  ): { parentId?: string } | CommandError {
    if (startIndex >= tokens.length) {
      return {};
    }

    if (tokens[startIndex] !== "in") {
      return {
        code: "invalid-argument",
        message: `unexpected token: ${tokens[startIndex]}`,
      };
    }

    if (startIndex + 2 !== tokens.length) {
      return {
        code: "invalid-argument",
        message: "expected 'in <containerId>' at the end of the command",
      };
    }

    const parentId = CommandLineParser.nonEmptyToken(tokens[startIndex + 1], "container id");

    if (CommandLineParser.isCommandError(parentId)) {
      return parentId;
    }

    return { parentId };
  }

  private static createResult(shape: ShapeSpec, parentId?: string): CommandParseResult {
    return {
      type: "command",
      command: {
        type: "create",
        shape,
        ...(parentId === undefined ? {} : { parentId }),
      },
    };
  }

  private static parseDelete(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("delete <id>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return { type: "command", command: { type: "delete", shapeId } };
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
      command: { type: "move", shapeId, dx: numbers[0], dy: numbers[1] },
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

    return { type: "command", command: { type: "scale", shapeId, factor } };
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
      command: { type: "set", shapeId, attribute, value },
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
      command: { type: "group", containerId, memberIds },
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

    return { type: "command", command: { type: "ungroup", containerId } };
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
      command: { type: "addto", containerId, shapeId },
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
      command: { type: "reorder", shapeId, position },
    };
  }

  private static parseTree(tokens: string[]): CommandParseResult {
    if (tokens.length === 1) {
      return { type: "command", command: { type: "tree" } };
    }

    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("tree [id]");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return { type: "command", command: { type: "tree", shapeId } };
  }

  private static parseShow(tokens: string[]): CommandParseResult {
    if (tokens.length !== 2) {
      return CommandLineParser.invalidArguments("show <id>");
    }

    const shapeId = CommandLineParser.nonEmptyToken(tokens[1], "shape id");

    if (CommandLineParser.isCommandError(shapeId)) {
      return CommandLineParser.errorResult(shapeId);
    }

    return { type: "command", command: { type: "show", shapeId } };
  }

  private static parseNoArgumentCommand(tokens: string[]): CommandParseResult {
    if (tokens.length !== 1) {
      return CommandLineParser.invalidArguments(tokens[0]);
    }

    switch (tokens[0]) {
      case "help":
        return { type: "command", command: { type: "help" } };
      case "undo":
        return { type: "command", command: { type: "undo" } };
      case "redo":
        return { type: "command", command: { type: "redo" } };
      case "exit":
        return { type: "command", command: { type: "exit" } };
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
