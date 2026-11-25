import { describe, expect, it } from "vitest";
import { EditableAttributeParser } from "../../../src/protocol/commands/builtin/SetCommand/EditableAttributeParser";
import { CommandErrorCode } from "../../../src/protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../../src/protocol/errors/ProtocolError";

describe("EditableAttributeParser", () => {
  const parser = new EditableAttributeParser();

  it("接受可编辑属性并识别数值属性", () => {
    expect(parser.parse("fill")).toBe("fill");
    expect(parser.isNumeric("fill")).toBe(false);
    expect(parser.parse("width")).toBe("width");
    expect(parser.isNumeric("width")).toBe(true);
  });

  it("拒绝未知属性", () => {
    expect(() => parser.parse("opacity")).toThrow(
      ProtocolError.commandParse(
        CommandErrorCode.UnknownAttribute,
        "unknown attribute: opacity",
      ),
    );
  });
});
