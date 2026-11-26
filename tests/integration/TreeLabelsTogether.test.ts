import { describe, expect, it } from "vitest";
import { CommandExecutor } from "@/core/CommandExecutor";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { HelpText } from "@/core/display/HelpText";
import { CommandHistory } from "@/core/history/CommandHistory";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { SaveCommand } from "@/_builtin/commands/SaveCommand/SaveCommand";
import { SetCommand } from "@/_builtin/commands/SetCommand/SetCommand";
import { BoxAttributeHandler } from "@/_plugin/shapes/BoxShape/BoxAttributeHandler";
import { BoxShape } from "@/_plugin/shapes/BoxShape/BoxShape";
import { BoxTypeLabelDecorator } from "@/_plugin/shapes/BoxShape/BoxTypeLabelDecorator";
import { ModifiedStarDecorator } from "@/_plugin/tree/ModifiedStarDecorator";
import { createBuiltinCatalog } from "../support/createBuiltinCatalog";
import { createPluginShapeCatalog } from "../support/createPluginShapeCatalog";
import { InMemorySvgStorage } from "../support/InMemorySvgStorage";

/** 插件间协作：两个标签并存且互不感知；拼接顺序 = 注册顺序。 */
describe("(box) 与 modified-star 并存", () => {
  async function run(
    order: readonly ("box" | "star")[],
  ): Promise<readonly string[]> {
    const shapeCatalog = createPluginShapeCatalog();
    const attributes = new AttributeRegistry();
    attributes.register(new BoxAttributeHandler());
    const decorators = new TreeDecoratorRegistry();

    for (const kind of order) {
      decorators.register(
        kind === "box" ? new BoxTypeLabelDecorator() : new ModifiedStarDecorator(),
      );
    }

    const history = new CommandHistory();
    const receiver = new EditorCommandReceiver(
      history,
      new InMemorySvgStorage(),
      new HelpText(createBuiltinCatalog(shapeCatalog)),
      shapeCatalog,
      attributes,
      decorators,
    );
    const executor = new CommandExecutor(receiver, history);

    await executor.execute(new InitCommand(800, 600));
    await executor.execute(
      new CreateCommand(BoxShape.create("n1", 120, 100, 160, 60, "开始")),
    );
    await executor.execute(new SaveCommand("s.svg"));
    await executor.execute(new SetCommand("n1", "fill", "#f5a623"));

    const result = (await receiver.tree()).toCommandResultDto();

    if (result.type !== "success") {
      throw new Error("tree failed");
    }

    return result.message.split("\n");
  }

  it("同一行 (box) 在前、* 在后；仅被修改的子部件带 *，祖先容器行也带 *", async () => {
    const lines = await run(["box", "star"]);

    expect(lines).toEqual([
      "svg (800x600) *",
      "└── g#n1 (box) *",
      "    ├── rect#n1-rect   x=120 y=100 w=160 h=60 fill=#f5a623 *",
      '    └── text#n1-label  (140,135) "开始"',
    ]);
  });

  it("拼接顺序跟随注册顺序：先 star 再 box 得到 `*` 在前", async () => {
    const lines = await run(["star", "box"]);

    expect(lines[1]).toBe("└── g#n1 * (box)");
  });
});
