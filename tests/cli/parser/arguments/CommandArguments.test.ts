import { describe, expect, it } from "vitest";
import { CommandArguments } from "../../../../src/cli/parser/arguments/CommandArguments";
import { CommandErrorCode } from "../../../../src/protocol/errors/CommandErrorCode";
import { CommandParseError } from "../../../../src/protocol/errors/CommandParseError";

function createArguments(tokens: readonly string[]): CommandArguments {
  return new CommandArguments(tokens, "move <id> <dx> <dy>");
}

describe("CommandArguments", () => {
  it("校验命令参数元数", () => {
    const args = createArguments(["move", "r1"]);

    expect(() => args.expectLength(4)).toThrow(
      "invalid arguments; usage: move <id> <dx> <dy>",
    );
    expect(() => args.expectMinimumLength(5)).toThrow(CommandParseError);
  });

  it("读取必填文本和数字", () => {
    const args = createArguments(["move", "r1", "-10", "20.5"]);

    expect(args.text(1, "shape id")).toBe("r1");
    expect(args.numbers(2, 2)).toEqual([-10, 20.5]);
  });

  it("区分必填文本与允许空字符串的原值", () => {
    const args = createArguments(["set", "t1", "text", ""]);

    expect(args.rawText(3, "attribute value")).toBe("");
    expect(() => args.text(3, "attribute value")).toThrow(
      "missing attribute value",
    );
  });

  it("报告非法数字", () => {
    const args = createArguments(["move", "r1", "abc", "0"]);

    expect(() => args.number(2)).toThrow(
      new CommandParseError(
        CommandErrorCode.InvalidNumber,
        "invalid number: abc",
      ),
    );
  });
});
