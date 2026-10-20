import { describe, expect, it } from "vitest";
import { DemoExecutor } from "../../src/core/DemoExecutor";

describe("DemoExecutor", () => {
  it("回显收到的命令类型", async () => {
    await expect(new DemoExecutor().execute({ type: "init" })).resolves.toEqual({
      type: "success",
      message: "received command: init",
    });
    await expect(
      new DemoExecutor().execute({
        type: "create",
        shape: { type: "g", id: "g1" },
      }),
    ).resolves.toEqual({
      type: "success",
      message: "received command: create",
    });
  });

  it("识别 exit", async () => {
    await expect(new DemoExecutor().execute({ type: "exit" })).resolves.toEqual({
      type: "exit",
    });
  });
});
