import { describe, expect, it } from "vitest";
import { parseConfigArg } from "@/host/parseConfigArg";

describe("parseConfigArg", () => {
  it("解析 --config 与 --config=", () => {
    expect(parseConfigArg(["--config", "a.json"])).toBe("a.json");
    expect(parseConfigArg(["--config=b.json"])).toBe("b.json");
    expect(parseConfigArg([])).toBeUndefined();
  });

  it("缺值时抛错", () => {
    expect(() => parseConfigArg(["--config"])).toThrow("missing value");
  });
});
