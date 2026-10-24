import { describe, expect, it } from "vitest";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../../src/protocol/errors/command/CommandExecutionError";
import { CommandErrorResult } from "../../src/protocol/results/outcomes/CommandErrorResult";
import { CommandExitResult } from "../../src/protocol/results/outcomes/CommandExitResult";
import { CommandResult } from "../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../src/protocol/results/outcomes/CommandSuccessResult";

describe("CommandResult 类层次", () => {
  it("具体结果共享基类并转换为边界 DTO", () => {
    const results: CommandResult[] = [
      new CommandSuccessResult("created"),
      new CommandErrorResult(
        new CommandExecutionError(CommandErrorCode.ShapeNotFound, "missing"),
      ),
      new CommandExitResult(),
    ];

    for (const result of results) {
      expect(result).toBeInstanceOf(CommandResult);
    }

    expect(results[0].isSuccess()).toBe(true);
    expect(results[1].isSuccess()).toBe(false);
    expect(results[2].isSuccess()).toBe(false);

    expect(results[0].toCommandResultDto()).toEqual({
      type: "success",
      message: "created",
    });
    expect(results[1].toCommandResultDto()).toEqual({
      type: "error",
      error: { code: CommandErrorCode.ShapeNotFound, message: "missing" },
    });
    expect(results[2].toCommandResultDto()).toEqual({ type: "exit" });
  });

  it("错误结果持有 ProtocolError 并生成可序列化 DTO", () => {
    const error = new CommandExecutionError(
      CommandErrorCode.CommandNotImplemented,
      "undo is not implemented",
    );
    const result = new CommandErrorResult(error);
    const dto = result.toCommandResultDto();

    expect(dto).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.CommandNotImplemented,
        message: "undo is not implemented",
      },
    });
    expect(JSON.parse(JSON.stringify(dto))).toEqual(dto);
  });
});
