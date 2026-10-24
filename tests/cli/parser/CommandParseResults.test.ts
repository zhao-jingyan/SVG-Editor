import { describe, expect, it } from "vitest";
import { CommandParseEmptyResult } from "../../../src/cli/parser/results/CommandParseEmptyResult";
import { CommandParseErrorResult } from "../../../src/cli/parser/results/CommandParseErrorResult";
import { CommandParseResult } from "../../../src/cli/parser/results/CommandParseResult";
import { CommandParseSuccessResult } from "../../../src/cli/parser/results/CommandParseSuccessResult";
import { HelpCommand } from "../../../src/protocol/commands/view/HelpCommand";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { CommandParseError } from "../../../src/protocol/errors/command/CommandParseError";

describe("CommandParseResult 类层次", () => {
  it("具体解析结果共享基类并转换为边界 DTO", () => {
    const command = new HelpCommand();
    const results: CommandParseResult[] = [
      new CommandParseSuccessResult(command),
      new CommandParseEmptyResult(),
      new CommandParseErrorResult(
        new CommandParseError(CommandErrorCode.InvalidCommand, "unknown"),
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
      new CommandParseError(CommandErrorCode.InvalidArgument, "bad input"),
    );
    const dto = result.toCommandParseResultDto();

    expect(JSON.parse(JSON.stringify(dto))).toEqual(dto);
  });
});
