import { describe, expect, it } from "vitest";
import { DemoExecutor } from "../../src/core/DemoExecutor";

describe("DemoExecutor", () => {
  it("回显普通输入", async () => {
    await expect(new DemoExecutor().execute("hello")).resolves.toEqual({
      type: "output",
      text: "received: hello",
    });
  });

  it("为空白输入返回空输出", async () => {
    await expect(new DemoExecutor().execute("  ")).resolves.toEqual({
      type: "output",
      text: "",
    });
  });

  it("识别 exit", async () => {
    await expect(new DemoExecutor().execute("exit")).resolves.toEqual({
      type: "exit",
    });
  });
});
