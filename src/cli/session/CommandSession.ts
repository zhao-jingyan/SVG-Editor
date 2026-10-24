import type { Executor } from "../../protocol/Executor";
import type { CommandParser } from "../parser/CommandParser";
import type { OutputWriter } from "../io/OutputWriter";
import { CommandSessionStatus } from "./CommandSessionStatus";

/**
 * 处理一次交互输入，并决定会话是否继续。
 * 解析结果如何反馈属于交互策略，不进入 Parser 或控制循环。
 */
export class CommandSession {
  public constructor(
    private readonly commandParser: CommandParser,
    private readonly executor: Executor,
    private readonly outputWriter: OutputWriter,
  ) {}

  public async handle(line: string): Promise<CommandSessionStatus> {
    const parseResult = this.commandParser.parse(line).toCommandParseResultDto();

    if (parseResult.type === "empty") {
      return CommandSessionStatus.Continue;
    }

    if (parseResult.type === "error") {
      await this.writeError(parseResult.error.message);
      return CommandSessionStatus.Continue;
    }

    const result = (
      await this.executor.execute(parseResult.command)
    ).toCommandResultDto();

    if (result.type === "exit") {
      return CommandSessionStatus.Exit;
    }

    if (result.type === "success") {
      await this.outputWriter.writeLine(result.message);
    } else {
      await this.writeError(result.error.message);
    }

    return CommandSessionStatus.Continue;
  }

  private async writeError(message: string): Promise<void> {
    await this.outputWriter.writeLine(`error: ${message}`);
  }
}
