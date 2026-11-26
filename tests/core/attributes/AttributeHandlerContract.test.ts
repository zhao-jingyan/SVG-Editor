import { describe, expect, it } from "vitest";
import { CommandExecutor } from "@/core/CommandExecutor";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { HelpText } from "@/core/display/HelpText";
import { CommandHistory } from "@/core/history/CommandHistory";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { GroupCommand } from "@/_builtin/commands/GroupCommand/GroupCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { RedoCommand } from "@/_builtin/commands/RedoCommand/RedoCommand";
import { SetCommand } from "@/_builtin/commands/SetCommand/SetCommand";
import { UndoCommand } from "@/_builtin/commands/UndoCommand/UndoCommand";
import { AttributeHandler } from "@/protocol/attributes/AttributeHandler";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { ShapeAttributeSnapshot } from "@/protocol/commands/memento/ShapeAttributeSnapshot";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import type { Shape } from "@/protocol/shapes/model/Shape";
import { createBuiltinCatalog } from "../../support/createBuiltinCatalog";
import { createBuiltinShapeCatalog } from "../../support/createBuiltinShapeCatalog";

/** 同时改 fill 与 stroke 两个“子部件”；可配置在第二步抛错。 */
class TwoStepHandler extends AttributeHandler {
  public constructor(
    private readonly handlerName: string,
    private readonly failure?: Error,
  ) {
    super();
  }

  public getName(): string {
    return this.handlerName;
  }

  public handles(_shape: Shape, attribute: string): boolean {
    return attribute === "both";
  }

  public capture(shape: Shape, _attribute: string): ShapeAttributeSnapshot {
    // 一个快照只记录一个叶子属性；这里用 fill 代表“首个被改部件”，
    // stroke 的恢复由处理器自己保证（见 apply 中的先后顺序）。
    return new ShapeAttributeSnapshot(
      shape.getId(),
      shape.getType(),
      "both",
      new Map([[shape.getId(), shape.getAttribute("fill")]]),
      "fill",
    );
  }

  public apply(shape: Shape, _attribute: string, value: string): string {
    shape.setAttribute("fill", value);

    if (this.failure !== undefined) {
      throw this.failure;
    }

    return `${shape.getType()}#${shape.getId()} both=${value}`;
  }
}

class MultiShapeHandler extends AttributeHandler {
  public constructor(private readonly failAfterApply: boolean = false) {
    super();
  }

  public getName(): string {
    return "multi-shape";
  }

  public handles(shape: Shape, attribute: string): boolean {
    return shape instanceof GroupShape && attribute === "fill-all";
  }

  public capture(shape: Shape, _attribute: string): ShapeAttributeSnapshot {
    if (!(shape instanceof GroupShape)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `not a group: ${shape.getId()}`,
      );
    }

    const values = new Map<string, string | number | undefined>();
    for (const child of shape.getChildren()) {
      values.set(child.getId(), child.getAttribute("fill"));
    }

    return new ShapeAttributeSnapshot(
      shape.getId(),
      shape.getType(),
      "fill-all",
      values,
      "fill",
    );
  }

  public apply(shape: Shape, _attribute: string, value: string): string {
    if (!(shape instanceof GroupShape)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `not a group: ${shape.getId()}`,
      );
    }

    for (const child of shape.getChildren()) {
      child.setAttribute("fill", value);
    }

    if (this.failAfterApply) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        "multi-shape failed",
      );
    }

    return `g#${shape.getId()} fill-all=${value}`;
  }
}

async function createEditor(
  handlers: readonly AttributeHandler[],
): Promise<{
  executor: CommandExecutor;
  receiver: EditorCommandReceiver;
}> {
  const shapeCatalog = createBuiltinShapeCatalog();
  const attributes = new AttributeRegistry();
  attributes.registerAll(handlers);
  const history = new CommandHistory();
  const receiver = new EditorCommandReceiver(
    history,
    undefined,
    new HelpText(createBuiltinCatalog(shapeCatalog)),
    shapeCatalog,
    attributes,
  );
  const executor = new CommandExecutor(receiver, history);
  await executor.execute(new InitCommand(100, 100));
  await executor.execute(
    new CreateCommand(new RectShape("r1", 0, 0, 10, 10, "red")),
  );
  return { executor, receiver };
}

describe("AttributeHandler 契约", () => {
  it("一次 set 是一个 undo 单元：undo 整体恢复，redo 整体重做", async () => {
    const { executor, receiver } = await createEditor([
      new TwoStepHandler("two-step"),
    ]);

    await executor.execute(new SetCommand("r1", "both", "blue"));
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("blue");

    await executor.execute(new UndoCommand());
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("red");

    await executor.execute(new RedoCommand());
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("blue");
  });

  it("一次 set 修改多个子部件后仍作为一个 undo 单元", async () => {
    const { executor, receiver } = await createEditor([
      new MultiShapeHandler(),
    ]);
    await executor.execute(
      new CreateCommand(new RectShape("r2", 0, 0, 10, 10, "red")),
    );
    await executor.execute(new GroupCommand("group", ["r1", "r2"]));

    await executor.execute(new SetCommand("group", "fill-all", "blue"));
    const group = receiver.getRootShapes()[0] as GroupShape;
    expect(group.getChildren().map((shape) => shape.getAttribute("fill"))).toEqual([
      "blue",
      "blue",
    ]);

    await executor.execute(new UndoCommand());
    expect(group.getChildren().map((shape) => shape.getAttribute("fill"))).toEqual([
      "red",
      "red",
    ]);

    await executor.execute(new RedoCommand());
    expect(group.getChildren().map((shape) => shape.getAttribute("fill"))).toEqual([
      "blue",
      "blue",
    ]);
  });

  it("多子部件修改后抛错：整次 set 回滚且不入历史", async () => {
    const { executor, receiver } = await createEditor([
      new MultiShapeHandler(true),
    ]);
    await executor.execute(
      new CreateCommand(new RectShape("r2", 0, 0, 10, 10, "red")),
    );
    await executor.execute(new GroupCommand("group", ["r1", "r2"]));

    const result = await executor.execute(new SetCommand("group", "fill-all", "blue"));
    const group = receiver.getRootShapes()[0] as GroupShape;

    expect(result.toCommandResultDto()).toEqual({
      type: "error",
      error: { code: "invalid-argument", message: "multi-shape failed" },
    });
    expect(group.getChildren().map((shape) => shape.getAttribute("fill"))).toEqual([
      "red",
      "red",
    ]);

    await executor.execute(new UndoCommand());
    expect(receiver.getRootShapes()).toHaveLength(2);
  });

  it("处理器部分修改后抛 ProtocolError：文档回滚，历史不变", async () => {
    const { executor, receiver } = await createEditor([
      new TwoStepHandler(
        "failing",
        ProtocolError.shape(CommandErrorCode.InvalidArgument, "half failed"),
      ),
    ]);

    const result = await executor.execute(new SetCommand("r1", "both", "blue"));

    expect(result.toCommandResultDto()).toEqual({
      type: "error",
      error: { code: "invalid-argument", message: "half failed" },
    });
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("red");

    // 历史未多出条目：一次 undo 撤销的是此前的 create，而不是失败的 set
    await executor.execute(new UndoCommand());
    expect(receiver.getRootShapes()).toHaveLength(0);
  });

  it("处理器部分修改后抛普通 Error：转为错误结果，进程不退出，文档回滚，历史不变", async () => {
    const { executor, receiver } = await createEditor([
      new TwoStepHandler("crashing", new Error("half-way")),
    ]);

    // 先做一次正常编辑，证明失败不会吞掉既有历史
    await executor.execute(new SetCommand("r1", "fill", "green"));

    const result = await executor.execute(new SetCommand("r1", "both", "blue"));

    expect(result.toCommandResultDto()).toEqual({
      type: "error",
      error: { code: "command-failed", message: "command failed: half-way" },
    });
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("green");

    // 历史仍指向上一次成功编辑
    await executor.execute(new UndoCommand());
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("red");
  });

  it("多个处理器同时命中：拒绝并报 ambiguous，不发生覆盖", async () => {
    const { executor, receiver } = await createEditor([
      new TwoStepHandler("first"),
      new TwoStepHandler("second"),
    ]);

    const result = await executor.execute(new SetCommand("r1", "both", "blue"));
    const dto = result.toCommandResultDto();

    expect(dto.type).toBe("error");
    expect(JSON.stringify(dto)).toContain(
      "ambiguous attribute handlers for rect#r1 both: first, second",
    );
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("red");

    await executor.execute(new UndoCommand());
    expect(receiver.getRootShapes()).toHaveLength(0);
  });

  it("无处理器命中：白名单属性可改，未定义属性报 unknown attribute", async () => {
    const { executor, receiver } = await createEditor([
      new TwoStepHandler("two-step"),
    ]);

    await executor.execute(new SetCommand("r1", "fill", "pink"));
    expect(receiver.getRootShapes()[0].getAttribute("fill")).toBe("pink");

    const bad = await executor.execute(new SetCommand("r1", "label", "x"));
    expect(bad.toCommandResultDto()).toEqual({
      type: "error",
      error: { code: "unknown-attribute", message: "unknown attribute: label" },
    });
  });
});
