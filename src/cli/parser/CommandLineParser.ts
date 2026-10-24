import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { CommandParseError } from "../../protocol/errors/CommandParseError";
import { ProtocolError } from "../../protocol/errors/ProtocolError";
import type { ShapeFactory } from "../../protocol/shapes/ShapeFactory";
import { CommandArguments } from "./arguments/CommandArguments";
import { CommandDefinitionRegistry } from "./definition/CommandDefinitionRegistry";
import type { CommandParser } from "./CommandParser";
import { CommandLineTokenizer } from "./tokenization/CommandLineTokenizer";
import { CommandParseEmptyResult } from "./results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "./results/CommandParseErrorResult";
import type { CommandParseResult } from "./results/CommandParseResult";
import { CommandParseSuccessResult } from "./results/CommandParseSuccessResult";

/**
 * CLI 命令解析入口，只负责词法、命令查找和结果包装。
 */
export class CommandLineParser implements CommandParser {
  private readonly definitions: CommandDefinitionRegistry;

  public constructor(
    shapeFactory: ShapeFactory,
    private readonly tokenizer: CommandLineTokenizer =
      new CommandLineTokenizer(),
  ) {
    this.definitions = new CommandDefinitionRegistry(shapeFactory);
  }

  public parse(line: string): CommandParseResult {
    try {
      const tokens = this.tokenizer.tokenize(line);

      if (tokens.length === 0) {
        return new CommandParseEmptyResult();
      }

      const commandName = tokens[0];
      const definition = this.definitions.find(commandName);

      if (definition === undefined) {
        throw new CommandParseError(
          CommandErrorCode.InvalidCommand,
          `unknown command: ${commandName}`,
        );
      }

      const command = definition.parse(
        new CommandArguments(tokens, definition.usage),
      );
      return new CommandParseSuccessResult(command);
    } catch (error: unknown) {
      if (error instanceof ProtocolError) {
        return new CommandParseErrorResult(error);
      }

      throw error;
    }
  }
}
