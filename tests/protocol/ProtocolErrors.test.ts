import { describe, expect, it } from "vitest";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { ErrorSource } from "../../src/protocol/errors/ErrorSource";
import { ProtocolError } from "../../src/protocol/errors/ProtocolError";

describe("ProtocolError", () => {
  it("通过来源枚举区分错误而不建立子类", () => {
    const errors: Array<[ProtocolError, ErrorSource]> = [
      [
        ProtocolError.commandParse(
          CommandErrorCode.InvalidArgument,
          "invalid arguments",
        ),
        ErrorSource.CommandParse,
      ],
      [
        ProtocolError.commandExecution(
          CommandErrorCode.CommandNotImplemented,
          "undo is not implemented",
        ),
        ErrorSource.CommandExecution,
      ],
      [
        ProtocolError.shape(
          CommandErrorCode.InvalidScale,
          "scale factor must be positive",
        ),
        ErrorSource.Shape,
      ],
      [
        ProtocolError.document(
          CommandErrorCode.ShapeNotFound,
          "no such shape: r1",
        ),
        ErrorSource.Document,
      ],
    ];

    for (const [error, source] of errors) {
      expect(error).toBeInstanceOf(ProtocolError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe(source);
      expect(error.getSource()).toBe(source);
      expect(error.getCode()).toBe(error.toCommandErrorDto().code);
      expect(error.toCommandErrorDto().message).toBe(error.message);
    }
  });

  it("边界 DTO 是普通对象且可 JSON 序列化", () => {
    const error = ProtocolError.shape(
      CommandErrorCode.UnknownAttribute,
      "unknown attribute: opacity",
    );
    const dto = error.toCommandErrorDto();

    expect(dto).not.toBeInstanceOf(Error);
    expect(dto).toEqual({
      code: CommandErrorCode.UnknownAttribute,
      message: "unknown attribute: opacity",
    });
    expect(JSON.parse(JSON.stringify(dto))).toEqual(dto);
  });

  it("错误码字符串值保持稳定", () => {
    expect(ErrorSource.CommandParse).toBe("command-parse");
    expect(ErrorSource.CommandExecution).toBe("command-execution");
    expect(ErrorSource.Document).toBe("document");
    expect(ErrorSource.Shape).toBe("shape");
    expect(CommandErrorCode.InvalidCommand).toBe("invalid-command");
    expect(CommandErrorCode.InvalidArgument).toBe("invalid-argument");
    expect(CommandErrorCode.InvalidNumber).toBe("invalid-number");
    expect(CommandErrorCode.UnknownShapeType).toBe("unknown-shape-type");
    expect(CommandErrorCode.UnknownAttribute).toBe("unknown-attribute");
    expect(CommandErrorCode.NoDocument).toBe("no-document");
    expect(CommandErrorCode.DuplicateId).toBe("duplicate-id");
    expect(CommandErrorCode.ShapeNotFound).toBe("shape-not-found");
    expect(CommandErrorCode.ContainerNotFound).toBe("container-not-found");
    expect(CommandErrorCode.NotContainer).toBe("not-container");
    expect(CommandErrorCode.InvalidScale).toBe("invalid-scale");
    expect(CommandErrorCode.IoRead).toBe("io-read");
    expect(CommandErrorCode.IoWrite).toBe("io-write");
    expect(CommandErrorCode.HistoryUnavailable).toBe("history-unavailable");
    expect(CommandErrorCode.CommandNotImplemented).toBe("command-not-implemented");
  });
});
