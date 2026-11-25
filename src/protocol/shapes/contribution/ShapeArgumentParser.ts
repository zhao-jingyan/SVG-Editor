import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";

/** 供各 ShapeContribution 复用的参数校验与数字解析。 */
export class ShapeArgumentParser {
  public requireArgumentCount(
    args: readonly string[],
    minimum: number,
    maximum: number,
    usage: string,
  ): void {
    if (args.length < minimum || args.length > maximum) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `invalid arguments; usage: ${usage}`,
      );
    }
  }

  public parseNumbers(args: readonly string[], count: number): number[] {
    const numbers: number[] = [];

    for (let index = 0; index < count; index += 1) {
      numbers.push(this.parseNumber(args[index]));
    }

    return numbers;
  }

  public parseNumber(token: string): number {
    if (token.trim().length === 0) {
      throw ProtocolError.shape(CommandErrorCode.InvalidNumber, "empty numeric value");
    }

    const value = Number(token);

    if (!Number.isFinite(value)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidNumber,
        `invalid number: ${token}`,
      );
    }

    return value;
  }

  public optionalStyle(style: string | undefined): string | undefined {
    if (style === undefined) {
      return undefined;
    }

    if (style === "in") {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        "expected 'in <containerId>' at the end of the command",
      );
    }

    if (style.trim().length === 0) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        "style value must not be empty",
      );
    }

    return style;
  }
}
