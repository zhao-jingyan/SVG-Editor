import { describe, expect, it } from "vitest";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../../src/protocol/errors/CommandExecutionError";
import { CommandParseError } from "../../src/protocol/errors/CommandParseError";
import { DocumentError } from "../../src/protocol/errors/DocumentError";
import { ProtocolError } from "../../src/protocol/errors/ProtocolError";
import { ShapeError } from "../../src/protocol/errors/ShapeError";

describe("ProtocolError 类层次", () => {
  it("按来源区分的错误共享基类行为", () => {
    const errors: ProtocolError[] = [
      new CommandParseError(
        CommandErrorCode.InvalidArgument,
        "invalid arguments",
      ),
      new CommandExecutionError(
        CommandErrorCode.CommandNotImplemented,
        "undo is not implemented",
      ),
      new ShapeError(CommandErrorCode.InvalidScale, "scale factor must be positive"),
      new DocumentError(CommandErrorCode.ShapeNotFound, "no such shape: r1"),
    ];

    for (const error of errors) {
      expect(error).toBeInstanceOf(ProtocolError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe(error.constructor.name);
      expect(error.getCode()).toBe(error.toCommandErrorDto().code);
      expect(error.toCommandErrorDto().message).toBe(error.message);
    }
  });

  it("边界 DTO 是普通对象且可 JSON 序列化", () => {
    const error = new ShapeError(
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
