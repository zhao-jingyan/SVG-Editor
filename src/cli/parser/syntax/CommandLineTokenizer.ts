import { CommandErrorCode } from "../../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../../protocol/errors/ProtocolError";

/**
 * 把一行 CLI 文本切分为带引号感知的参数。
 */
export class CommandLineTokenizer {
  public tokenize(line: string): readonly string[] {
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      return [];
    }

    return this.scan(trimmed);
  }

  private scan(input: string): readonly string[] {
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
      throw ProtocolError.commandParse(
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
