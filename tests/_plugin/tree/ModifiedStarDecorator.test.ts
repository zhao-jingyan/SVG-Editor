import { describe, expect, it } from "vitest";
import { CommandExecutor } from "@/core/CommandExecutor";
import { HelpText } from "@/core/display/HelpText";
import { CommandHistory } from "@/core/history/CommandHistory";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { DeleteCommand } from "@/_builtin/commands/DeleteCommand/DeleteCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { MoveCommand } from "@/_builtin/commands/MoveCommand/MoveCommand";
import { ReorderCommand } from "@/_builtin/commands/ReorderCommand/ReorderCommand";
import { SaveCommand } from "@/_builtin/commands/SaveCommand/SaveCommand";
import { UndoCommand } from "@/_builtin/commands/UndoCommand/UndoCommand";
import { ModifiedStarDecorator } from "@/_plugin/tree/ModifiedStarDecorator";
import type { Command } from "@/protocol/commands/Command";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { createBuiltinCatalog } from "../../support/createBuiltinCatalog";
import { createBuiltinShapeCatalog } from "../../support/createBuiltinShapeCatalog";
import { InMemorySvgStorage } from "../../support/InMemorySvgStorage";

/** 只依赖内置图形与本插件：独立可测，不引入其他插件。 */
class Editor {
  private readonly receiver: EditorCommandReceiver;
  private readonly executor: CommandExecutor;

  public constructor() {
    const shapeCatalog = createBuiltinShapeCatalog();
    const decorators = new TreeDecoratorRegistry();
    decorators.register(new ModifiedStarDecorator());
    const history = new CommandHistory();
    this.receiver = new EditorCommandReceiver(
      history,
      new InMemorySvgStorage(),
      new HelpText(createBuiltinCatalog(shapeCatalog)),
      shapeCatalog,
      undefined,
      decorators,
    );
    this.executor = new CommandExecutor(this.receiver, history);
  }

  public async run(...commands: readonly Command[]): Promise<void> {
    for (const command of commands) {
      await this.executor.execute(command);
    }
  }

  public async tree(): Promise<readonly string[]> {
    const result = (await this.receiver.tree()).toCommandResultDto();

    if (result.type !== "success") {
      throw new Error("tree failed");
    }

    return result.message.split("\n");
  }
}

describe("ModifiedStarDecorator 状态机", () => {
  it("初始化后无 *；新建节点立即标记，画布行同步标记", async () => {
    const editor = new Editor();
    await editor.run(new InitCommand(50, 50));
    expect(await editor.tree()).toEqual(["svg (50x50)"]);

    await editor.run(new CreateCommand(new RectShape("a", 0, 0, 1, 1)));
    const lines = await editor.tree();
    expect(lines[0]).toBe("svg (50x50) *");
    expect(lines[1]).toMatch(/rect#a .* \*$/);
  });

  it("编辑 → 保存 → 再编辑 → undo 回到保存点：* 出现、消失、再出现、再消失", async () => {
    const editor = new Editor();
    await editor.run(
      new InitCommand(50, 50),
      new CreateCommand(new RectShape("a", 0, 0, 1, 1)),
    );
    expect((await editor.tree())[0]).toBe("svg (50x50) *");

    await editor.run(new SaveCommand("s.svg"));
    expect((await editor.tree()).join("\n")).not.toContain("*");

    await editor.run(new MoveCommand("a", 5, 0));
    const edited = await editor.tree();
    expect(edited[0]).toBe("svg (50x50) *");
    expect(edited[1]).toMatch(/\*$/);

    await editor.run(new UndoCommand());
    expect((await editor.tree()).join("\n")).not.toContain("*");
  });

  it("按内容而非按“发生过编辑”：保存后未改动的兄弟不带 *", async () => {
    const editor = new Editor();
    await editor.run(
      new InitCommand(50, 50),
      new CreateCommand(new RectShape("a", 0, 0, 1, 1)),
      new CreateCommand(new RectShape("b", 0, 0, 1, 1)),
      new SaveCommand("s.svg"),
      new MoveCommand("a", 3, 3),
    );

    const lines = await editor.tree();
    expect(lines.find((line) => line.includes("rect#a"))).toMatch(/\*$/);
    expect(lines.find((line) => line.includes("rect#b"))).not.toMatch(/\*/);
  });

  it("祖先传播：改容器内叶子时，叶子、容器与画布行都带 *", async () => {
    const editor = new Editor();
    await editor.run(
      new InitCommand(50, 50),
      new CreateCommand(new GroupShape("g1", [new RectShape("a", 0, 0, 1, 1)])),
      new SaveCommand("s.svg"),
      new MoveCommand("a", 1, 1),
    );

    const lines = await editor.tree();
    expect(lines[0]).toBe("svg (50x50) *");
    expect(lines.find((line) => line.includes("g#g1"))).toMatch(/\*$/);
    expect(lines.find((line) => line.includes("rect#a"))).toMatch(/\*$/);
  });

  it("保存后删除根层图形：画布行带 *，undo 回保存点后消失", async () => {
    const editor = new Editor();
    await editor.run(
      new InitCommand(50, 50),
      new CreateCommand(new RectShape("a", 0, 0, 1, 1)),
      new CreateCommand(new RectShape("b", 0, 0, 1, 1)),
      new SaveCommand("s.svg"),
    );

    await editor.run(new DeleteCommand("b"));
    expect((await editor.tree())[0]).toBe("svg (50x50) *");

    await editor.run(new UndoCommand());
    expect((await editor.tree()).join("\n")).not.toContain("*");
  });

  it("保存后根层 front 重排：画布行带 *，undo 回保存点后消失", async () => {
    const editor = new Editor();
    await editor.run(
      new InitCommand(50, 50),
      new CreateCommand(new RectShape("a", 0, 0, 1, 1)),
      new CreateCommand(new RectShape("b", 0, 0, 1, 1)),
      new SaveCommand("s.svg"),
    );

    await editor.run(new ReorderCommand("b", "front"));
    expect((await editor.tree())[0]).toBe("svg (50x50) *");

    await editor.run(new UndoCommand());
    expect((await editor.tree()).join("\n")).not.toContain("*");
  });

  it("状态封装在实例字段：两个编辑器各自的装饰器互不影响", async () => {
    const first = new Editor();
    const second = new Editor();

    await first.run(
      new InitCommand(50, 50),
      new CreateCommand(new RectShape("a", 0, 0, 1, 1)),
      new SaveCommand("s.svg"),
    );
    await second.run(
      new InitCommand(50, 50),
      new CreateCommand(new RectShape("a", 0, 0, 1, 1)),
    );

    expect((await first.tree()).join("\n")).not.toContain("*");
    expect((await second.tree())[0]).toBe("svg (50x50) *");
  });
});
