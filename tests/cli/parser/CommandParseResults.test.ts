import { describe, expect, it } from "vitest";
import { CommandParseEmptyResult } from "@/cli/parser/results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "@/cli/parser/results/CommandParseErrorResult";
import { CommandParseResult } from "@/cli/parser/results/CommandParseResult";
import { CommandParseSuccessResult } from "@/cli/parser/results/CommandParseSuccessResult";
import { HelpCommand } from "@/builtin/commands/HelpCommand/HelpCommand";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";

describe("CommandParseResult 类层次", () => {
  it("具体解析结果共享基类并转换为边界 DTO", () => {
    const command = new HelpCommand();
    const results: CommandParseResult[] = [
      new CommandParseSuccessResult(command),
      new CommandParseEmptyResult(),
      new CommandParseErrorResult(
        ProtocolError.commandParse(CommandErrorCode.InvalidCommand, "unknown"),
      ),
    ];

    for (const result of results) {
      expect(result).toBeInstanceOf(CommandParseResult);
    }

    expect(results[0].toCommandParseResultDto()).toEqual({
      type: "command",
      command,
    });
    expect(results[1].toCommandParseResultDto()).toEqual({ type: "empty" });
    expect(results[2].toCommandParseResultDto()).toEqual({
      type: "error",
      error: { code: CommandErrorCode.InvalidCommand, message: "unknown" },
    });
  });

  it("解析错误 DTO 可序列化", () => {
    const result = new CommandParseErrorResult(
      ProtocolError.commandParse(CommandErrorCode.InvalidArgument, "bad input"),
    );
    const dto = result.toCommandParseResultDto();

    expect(JSON.parse(JSON.stringify(dto))).toEqual(dto);
  });
});
