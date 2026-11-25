import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";

/**
 * 封装命令参数（不含命令名）的元数校验和类型转换。
 */
export class CommandParameters {
  public constructor(
    private readonly values: readonly string[],
    private readonly usage: string,
  ) {}

  public get length(): number {
    return this.values.length;
  }

  public hasLength(expected: number): boolean {
    return this.values.length === expected;
  }

  public expectLength(expected: number): void {
    if (!this.hasLength(expected)) {
      this.invalidArguments();
    }
  }

  public expectMinimumLength(minimum: number): void {
    if (this.values.length < minimum) {
      this.invalidArguments();
    }
  }

  public tokenAt(index: number): string | undefined {
    return this.values[index];
  }

  public text(index: number, label: string): string {
    const token = this.tokenAt(index);

    if (token === undefined || token.trim().length === 0) {
      throw ProtocolError.commandParse(
        CommandErrorCode.InvalidArgument,
        `missing ${label}`,
      );
    }

    return token;
  }

  public rawText(index: number, label: string): string {
    const token = this.tokenAt(index);

    if (token === undefined) {
      throw ProtocolError.commandParse(
        CommandErrorCode.InvalidArgument,
        `missing ${label}`,
      );
    }

    return token;
  }

  public number(index: number): number {
    const token = this.rawText(index, `numeric argument at position ${index + 1}`);

    if (token.trim().length === 0) {
      throw ProtocolError.commandParse(
        CommandErrorCode.InvalidNumber,
        "empty numeric value",
      );
    }

    const value = Number(token);

    if (!Number.isFinite(value)) {
      throw ProtocolError.commandParse(
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
    return this.values.slice(startIndex, endIndex);
  }

  private invalidArguments(): never {
    throw ProtocolError.commandParse(
      CommandErrorCode.InvalidArgument,
      `invalid arguments; usage: ${this.usage}`,
    );
  }
}
