import { describe, expect, it } from "vitest";
import { CommandLineTokenizer } from "../../../../src/cli/parser/tokenization/CommandLineTokenizer";
import { CommandParseError } from "../../../../src/protocol/errors/CommandParseError";

const tokenizer = new CommandLineTokenizer();

describe("CommandLineTokenizer", () => {
  it("忽略空行、空白行和注释行", () => {
    expect(tokenizer.tokenize("")).toEqual([]);
    expect(tokenizer.tokenize("   ")).toEqual([]);
    expect(tokenizer.tokenize("  # create rect r1 0 0 10 10")).toEqual([]);
  });

  it("保留引号中的空白和空字符串", () => {
    expect(tokenizer.tokenize('create text t1 0 0 "hello world"')).toEqual([
      "create",
      "text",
      "t1",
      "0",
      "0",
      "hello world",
    ]);
    expect(tokenizer.tokenize('set t1 text ""')).toEqual([
      "set",
      "t1",
      "text",
      "",
    ]);
  });

  it("拒绝未闭合的引号", () => {
    expect(() => tokenizer.tokenize('create text t1 0 0 "unterminated')).toThrow(
      CommandParseError,
    );
  });
});
