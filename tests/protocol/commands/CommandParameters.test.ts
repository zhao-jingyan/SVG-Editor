import { describe, expect, it } from "vitest";
import { CommandParameters } from "../../../src/protocol/commands/_common/contribution/CommandParameters";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../../src/protocol/errors/ProtocolError";

function createParameters(values: readonly string[]): CommandParameters {
  return new CommandParameters(values, "move <id> <dx> <dy>");
}

describe("CommandParameters", () => {
  it("校验参数元数", () => {
    const parameters = createParameters(["r1"]);

    expect(() => parameters.expectLength(3)).toThrow(
      "invalid arguments; usage: move <id> <dx> <dy>",
    );
    expect(() => parameters.expectMinimumLength(4)).toThrow(ProtocolError);
  });

  it("读取必填文本和数字", () => {
    const parameters = createParameters(["r1", "-10", "20.5"]);

    expect(parameters.text(0, "shape id")).toBe("r1");
    expect(parameters.numbers(1, 2)).toEqual([-10, 20.5]);
  });

  it("区分必填文本与允许空字符串的原值", () => {
    const parameters = createParameters(["t1", "text", ""]);

    expect(parameters.rawText(2, "attribute value")).toBe("");
    expect(() => parameters.text(2, "attribute value")).toThrow(
      "missing attribute value",
    );
  });

  it("报告非法数字", () => {
    const parameters = createParameters(["r1", "abc", "0"]);

    expect(() => parameters.number(1)).toThrow(
      ProtocolError.commandParse(
        CommandErrorCode.InvalidNumber,
        "invalid number: abc",
      ),
    );
  });

  it("支持切片", () => {
    const parameters = createParameters(["a", "b", "c", "d"]);

    expect(parameters.slice(1)).toEqual(["b", "c", "d"]);
    expect(parameters.slice(1, 3)).toEqual(["b", "c"]);
  });
});
