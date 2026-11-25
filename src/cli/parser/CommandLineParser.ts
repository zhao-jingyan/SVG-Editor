import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../protocol/errors/ProtocolError";
import type { CommandCatalog } from "../../protocol/plugins/CommandCatalog";
import type { CommandParser } from "./CommandParser";
import { CommandLineTokenizer } from "./syntax/CommandLineTokenizer";
import { CommandParseEmptyResult } from "./results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "./results/CommandParseErrorResult";
import type { CommandParseResult } from "./results/CommandParseResult";
import { CommandParseSuccessResult } from "./results/CommandParseSuccessResult";

/**
 * CLI 命令解析入口，只负责词法、命令查找和结果包装。
 */
export class CommandLineParser implements CommandParser {
  public constructor(
    private readonly definitions: CommandCatalog,
    private readonly tokenizer: CommandLineTokenizer =
      new CommandLineTokenizer(),
  ) {}

  public parse(line: string): CommandParseResult {
    try {
      const tokens = this.tokenizer.tokenize(line);

      if (tokens.length === 0) {
        return new CommandParseEmptyResult();
      }

      const commandName = tokens[0];
      const definition = this.definitions.find(commandName);

      if (definition === undefined) {
        throw ProtocolError.commandParse(
          CommandErrorCode.InvalidCommand,
          `unknown command: ${commandName}`,
        );
      }

      const command = definition.parse(tokens);
      return new CommandParseSuccessResult(command);
    } catch (error: unknown) {
      if (error instanceof ProtocolError) {
        return new CommandParseErrorResult(error);
      }

      throw error;
    }
  }
}
