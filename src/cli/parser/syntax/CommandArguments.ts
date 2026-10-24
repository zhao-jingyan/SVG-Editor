import { CommandErrorCode } from "../../../protocol/errors/CommandErrorCode";
import { CommandParseError } from "../../../protocol/errors/command/CommandParseError";

/**
 * 封装命令参数的元数校验和类型转换。
 */
export class CommandArguments {
  public constructor(
    private readonly tokens: readonly string[],
    private readonly usage: string,
  ) {}

  public get length(): number {
    return this.tokens.length;
  }

  public hasLength(expected: number): boolean {
    return this.tokens.length === expected;
  }

  public expectLength(expected: number): void {
    if (!this.hasLength(expected)) {
      this.invalidArguments();
    }
  }

  public expectMinimumLength(minimum: number): void {
    if (this.tokens.length < minimum) {
      this.invalidArguments();
    }
  }

  public tokenAt(index: number): string | undefined {
    return this.tokens[index];
  }

  public text(index: number, label: string): string {
    const token = this.tokenAt(index);

    if (token === undefined || token.trim().length === 0) {
      throw new CommandParseError(
        CommandErrorCode.InvalidArgument,
        `missing ${label}`,
      );
    }

    return token;
  }

  public rawText(index: number, label: string): string {
    const token = this.tokenAt(index);

    if (token === undefined) {
      throw new CommandParseError(
        CommandErrorCode.InvalidArgument,
        `missing ${label}`,
      );
    }

    return token;
  }

  public number(index: number): number {
    const token = this.rawText(index, `numeric argument at position ${index + 1}`);

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

  public numbers(startIndex: number, count: number): readonly number[] {
    const values: number[] = [];

    for (let offset = 0; offset < count; offset += 1) {
      values.push(this.number(startIndex + offset));
    }

    return values;
  }

  public slice(startIndex: number, endIndex?: number): readonly string[] {
    return this.tokens.slice(startIndex, endIndex);
  }

  private invalidArguments(): never {
    throw new CommandParseError(
      CommandErrorCode.InvalidArgument,
      `invalid arguments; usage: ${this.usage}`,
    );
  }
}
