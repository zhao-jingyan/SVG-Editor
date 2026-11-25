import { describe, expect, it } from "vitest";
import { CommandExecutor } from "@/core/CommandExecutor";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { CommandHistory } from "@/core/history/CommandHistory";
import { HelpText } from "@/core/display/HelpText";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { RedoCommand } from "@/_builtin/commands/RedoCommand/RedoCommand";
import { SetCommand } from "@/_builtin/commands/SetCommand/SetCommand";
import { UndoCommand } from "@/_builtin/commands/UndoCommand/UndoCommand";
import { BoxAttributeHandler } from "@/_plugin/shapes/BoxShape/BoxAttributeHandler";
import { BoxShape } from "@/_plugin/shapes/BoxShape/BoxShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { createBuiltinCatalog } from "../../../support/createBuiltinCatalog";
import { createPluginShapeCatalog } from "../../../support/createPluginShapeCatalog";

describe("BoxAttributeHandler", () => {
  async function createExecutor(): Promise<{
    executor: CommandExecutor;
    receiver: EditorCommandReceiver;
  }> {
    const shapeCatalog = createPluginShapeCatalog();
    const attributeCatalog = new AttributeRegistry();
    attributeCatalog.register(new BoxAttributeHandler());
    const history = new CommandHistory();
    const receiver = new EditorCommandReceiver(
      history,
      undefined,
      new HelpText(createBuiltinCatalog(shapeCatalog)),
      shapeCatalog,
      attributeCatalog,
    );
    const executor = new CommandExecutor(receiver, history);
    await executor.execute(new InitCommand(800, 600));
    await executor.execute(
      new CreateCommand(BoxShape.create("n1", 120, 100, 160, 60, "开始")),
    );
    return { executor, receiver };
  }

  it("set fill / label 各为一个 undo 单元", async () => {
    const { executor, receiver } = await createExecutor();

    const fillResult = await executor.execute(
      new SetCommand("n1", "fill", "#f5a623"),
    );
    expect(fillResult.toCommandResultDto()).toEqual({
      type: "success",
      message: "box#n1 fill propagated to n1-rect",
    });

    const labelResult = await executor.execute(
      new SetCommand("n1", "label", "处理数据 v2"),
    );
    expect(labelResult.toCommandResultDto()).toEqual({
      type: "success",
      message: 'box#n1 label updated: "处理数据 v2"',
    });

    const box = receiver.getRootShapes()[0] as BoxShape;
    const body = box.getChildren()[0] as RectShape;
    expect(body.getAttribute("fill")).toBe("#f5a623");
    expect(box.getChildren()[1].getAttribute("text")).toBe("处理数据 v2");

    await executor.execute(new UndoCommand());
    expect(box.getChildren()[1].getAttribute("text")).toBe("开始");
    expect(body.getAttribute("fill")).toBe("#f5a623");

    await executor.execute(new UndoCommand());
    expect(body.getAttribute("fill")).toBe("#4a90d9");

    await executor.execute(new RedoCommand());
    expect(body.getAttribute("fill")).toBe("#f5a623");

    await executor.execute(new RedoCommand());
    expect(box.getChildren()[1].getAttribute("text")).toBe("处理数据 v2");
  });

  it("普通图形无处理器时仍走 Phase 1 白名单", async () => {
    const { executor, receiver } = await createExecutor();
    await executor.execute(
      new CreateCommand(new RectShape("r1", 0, 0, 10, 10)),
    );

    const ok = await executor.execute(new SetCommand("r1", "fill", "red"));
    expect(ok.toCommandResultDto()).toMatchObject({ type: "success" });
    expect(receiver.getRootShapes()[1].getAttribute("fill")).toBe("red");

    const bad = await executor.execute(new SetCommand("r1", "label", "x"));
    expect(bad.toCommandResultDto()).toMatchObject({
      type: "error",
      error: { code: "unknown-attribute", message: "unknown attribute: label" },
    });
  });
});
