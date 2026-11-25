import { describe, expect, it } from "vitest";
import { CommandExecutor } from "@/core/CommandExecutor";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { TreeDisplay } from "@/core/display/TreeDisplay";
import { HelpText } from "@/core/display/HelpText";
import { Document } from "@/core/document/Document";
import { CommandHistory } from "@/core/history/CommandHistory";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { MoveCommand } from "@/_builtin/commands/MoveCommand/MoveCommand";
import { SaveCommand } from "@/_builtin/commands/SaveCommand/SaveCommand";
import { UndoCommand } from "@/_builtin/commands/UndoCommand/UndoCommand";
import { BoxAttributeHandler } from "@/_plugin/shapes/BoxShape/BoxAttributeHandler";
import { BoxShape } from "@/_plugin/shapes/BoxShape/BoxShape";
import { BoxTypeLabelDecorator } from "@/_plugin/tree/BoxTypeLabelDecorator";
import { ModifiedStarDecorator } from "@/_plugin/tree/ModifiedStarDecorator";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { createBuiltinCatalog } from "../../support/createBuiltinCatalog";
import { createPluginShapeCatalog } from "../../support/createPluginShapeCatalog";
import { InMemorySvgStorage } from "../../support/InMemorySvgStorage";

describe("TreeDecorator 插件", () => {
  it("无装饰器时 tree 基线不变", () => {
    const document = new Document(800, 600);
    document.addShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
    expect(new TreeDisplay().render(document)).toBe(
      ["svg (800x600)", "└── rect#bg  x=0 y=0 w=800 h=600 fill=#ffffff"].join(
        "\n",
      ),
    );
  });

  it("box 行追加 (box)", () => {
    const document = new Document(100, 100);
    document.addShape(BoxShape.create("n1", 0, 0, 40, 20, "t"));
    const decorators = new TreeDecoratorRegistry();
    decorators.register(new BoxTypeLabelDecorator());
    const tree = new TreeDisplay(decorators).render(document);
    expect(tree).toContain("g#n1 (box)");
    expect(tree).toContain("rect#n1-rect");
  });

  it("modified-star：编辑→保存→再编辑→undo 回保存点", async () => {
    const shapeCatalog = createPluginShapeCatalog();
    const attributes = new AttributeRegistry();
    attributes.register(new BoxAttributeHandler());
    const star = new ModifiedStarDecorator();
    const treeDecorators = new TreeDecoratorRegistry();
    treeDecorators.registerAll([new BoxTypeLabelDecorator(), star]);
    const storage = new InMemorySvgStorage();
    const history = new CommandHistory();
    const receiver = new EditorCommandReceiver(
      history,
      storage,
      new HelpText(createBuiltinCatalog(shapeCatalog)),
      shapeCatalog,
      attributes,
      treeDecorators,
    );
    const executor = new CommandExecutor(receiver, history);

    await executor.execute(new InitCommand(800, 600));
    await executor.execute(
      new CreateCommand(BoxShape.create("n1", 120, 100, 160, 60, "开始")),
    );

    let tree = (
      await receiver.tree()
    ).toCommandResultDto() as { type: "success"; message: string };
    expect(tree.message).toContain("svg (800x600) *");
    expect(tree.message).toContain("g#n1 (box) *");

    await executor.execute(new SaveCommand("box.svg"));
    tree = (await receiver.tree()).toCommandResultDto() as {
      type: "success";
      message: string;
    };
    expect(tree.message).not.toContain(" *");
    expect(tree.message).toContain("g#n1 (box)");

    await executor.execute(new MoveCommand("n1", 10, 0));
    tree = (await receiver.tree()).toCommandResultDto() as {
      type: "success";
      message: string;
    };
    expect(tree.message).toContain("svg (800x600) *");
    expect(tree.message).toContain("g#n1 (box) *");

    await executor.execute(new UndoCommand());
    tree = (await receiver.tree()).toCommandResultDto() as {
      type: "success";
      message: string;
    };
    expect(tree.message).not.toContain(" *");
    expect(tree.message).toContain("g#n1 (box)");
  });
});
