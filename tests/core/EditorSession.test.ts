import { describe, expect, it } from "vitest";
import { CommandExecutor } from "../../src/core/CommandExecutor";
import { EditorSession } from "../../src/core/EditorSession";
import { Command } from "../../src/protocol/commands/Command";
import { AddToCommand } from "../../src/protocol/commands/shape/AddToCommand";
import { CanvasCommand } from "../../src/protocol/commands/doc/CanvasCommand";
import { CreateCommand } from "../../src/protocol/commands/shape/CreateCommand";
import { DeleteCommand } from "../../src/protocol/commands/shape/DeleteCommand";
import { GroupCommand } from "../../src/protocol/commands/shape/GroupCommand";
import { HelpCommand } from "../../src/protocol/commands/view/HelpCommand";
import { InitCommand } from "../../src/protocol/commands/doc/InitCommand";
import { MoveCommand } from "../../src/protocol/commands/shape/MoveCommand";
import { ReadCommand } from "../../src/protocol/commands/doc/ReadCommand";
import { RedoCommand } from "../../src/protocol/commands/history/RedoCommand";
import { ReorderCommand } from "../../src/protocol/commands/shape/ReorderCommand";
import { SaveCommand } from "../../src/protocol/commands/doc/SaveCommand";
import { ScaleCommand } from "../../src/protocol/commands/shape/ScaleCommand";
import { SetCommand } from "../../src/protocol/commands/shape/SetCommand";
import { ShowCommand } from "../../src/protocol/commands/view/ShowCommand";
import { TreeCommand } from "../../src/protocol/commands/view/TreeCommand";
import { UndoCommand } from "../../src/protocol/commands/history/UndoCommand";
import { UngroupCommand } from "../../src/protocol/commands/shape/UngroupCommand";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { CommandErrorResult } from "../../src/protocol/results/outcomes/CommandErrorResult";
import type { CommandResult } from "../../src/protocol/results/CommandResult";
import { CircleShape } from "../../src/protocol/shapes/concrete/CircleShape";
import { GroupShape } from "../../src/protocol/shapes/concrete/GroupShape";
import { RectShape } from "../../src/protocol/shapes/concrete/RectShape";
import { TextShape } from "../../src/protocol/shapes/concrete/TextShape";
import { InMemorySvgStorage } from "../support/InMemorySvgStorage";

function expectErrorMessage(
  result: CommandResult,
  code: CommandErrorCode,
  message: string,
): void {
  expect(result).toBeInstanceOf(CommandErrorResult);
  expect(result.toCommandResultDto()).toEqual({
    type: "error",
    error: { code, message },
  });
}

function createEditor(storage?: InMemorySvgStorage): {
  session: EditorSession;
  executor: CommandExecutor;
} {
  const session = new EditorSession(storage);
  return { session, executor: new CommandExecutor(session) };
}

async function initialize(
  executor: CommandExecutor,
  width = 800,
  height = 600,
): Promise<void> {
  const result = await executor.execute(new InitCommand(width, height));
  expect(result.toCommandResultDto()).toEqual({
    type: "success",
    message: `canvas ${width}x${height} created`,
  });
}

describe("EditorSession", () => {
  it("管理文档生命周期、画布查询和历史锁", async () => {
    const { executor } = createEditor();

    expectErrorMessage(
      await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 10, 10))),
      CommandErrorCode.NoDocument,
      "no document. use 'init' or 'read' first",
    );

    await initialize(executor, 1024, 768);
    expect((await executor.execute(new CanvasCommand())).toCommandResultDto()).toEqual({
      type: "success",
      message: "canvas 1024x768",
    });
    expect(
      (await executor.execute(new CanvasCommand(800, 600))).toCommandResultDto(),
    ).toEqual({ type: "success", message: "canvas 800x600 resized" });

    expectErrorMessage(
      await executor.execute(new UndoCommand()),
      CommandErrorCode.HistoryUnavailable,
      "undo not allowed after io command",
    );
  });

  it("执行 move 后撤销和重做", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 10, 10)));

    expect(
      (await executor.execute(new MoveCommand("r1", 5, 5))).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 moved to (5,5)" });
    expect(session.captureAttribute("r1", "x").getValue("r1")).toBe(5);

    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 moved back to (0,0)" });
    expect(session.captureAttribute("r1", "x").getValue("r1")).toBe(0);

    expect(
      (await executor.execute(new RedoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 moved to (5,5)" });
    expect(session.captureAttribute("r1", "x").getValue("r1")).toBe(5);
  });

  it("执行 scale 后撤销，并支持创建命令的撤销与重做", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 10, 10)));

    expect(
      (await executor.execute(new ScaleCommand("r1", 2))).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 scaled by 2" });
    expect(session.captureAttribute("r1", "width").getValue("r1")).toBe(20);

    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 scaled back by 0.5" });
    expect(session.captureAttribute("r1", "width").getValue("r1")).toBe(10);

    await executor.execute(new RedoCommand());
    expect(session.captureAttribute("r1", "width").getValue("r1")).toBe(20);
    await executor.execute(new UndoCommand());
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 deleted" });
    expect(() => session.capturePlacement("r1")).toThrow("no such shape: r1");

    expect(
      (await executor.execute(new RedoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 created" });
    expect(session.capturePlacement("r1").getIndex()).toBe(0);
  });

  it("删除后精确恢复原父级和索引", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("first", 0, 0, 1, 1)));
    await executor.execute(new CreateCommand(new RectShape("second", 0, 0, 1, 1)));
    await executor.execute(new CreateCommand(new RectShape("third", 0, 0, 1, 1)));

    expect(
      (await executor.execute(new DeleteCommand("second"))).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#second deleted" });
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#second restored" });
    expect(session.capturePlacement("second").getIndex()).toBe(1);

    await executor.execute(new RedoCommand());
    expect(() => session.capturePlacement("second")).toThrow(
      "no such shape: second",
    );
  });

  it("group 撤销恢复成员顺序，redo 重建容器", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));
    await executor.execute(new CreateCommand(new CircleShape("r2", 0, 0, 1)));
    await executor.execute(new CreateCommand(new TextShape("r3", 0, 0, "text")));

    expect(
      (await executor.execute(new GroupCommand("g1", ["r3", "r1"]))).toCommandResultDto(),
    ).toEqual({ type: "success", message: "g#g1 created with 2 children" });
    expect(session.capturePlacement("r1").getParentId()).toBe("g1");

    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "g#g1 removed" });
    expect(() => session.capturePlacement("g1")).toThrow("no such shape: g1");
    expect(session.capturePlacement("r1").getIndex()).toBe(0);
    expect(session.capturePlacement("r2").getIndex()).toBe(1);
    expect(session.capturePlacement("r3").getIndex()).toBe(2);

    await executor.execute(new RedoCommand());
    expect(session.capturePlacement("r1").getParentId()).toBe("g1");
    expect(session.capturePlacement("r3").getParentId()).toBe("g1");
  });

  it("ungroup 撤销恢复容器结构", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new GroupShape("outer")));
    await executor.execute(new CreateCommand(new GroupShape("inner"), "outer"));
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1), "inner"));
    await executor.execute(new CreateCommand(new CircleShape("r2", 0, 0, 1), "inner"));

    expect(
      (await executor.execute(new UngroupCommand("inner"))).toCommandResultDto(),
    ).toEqual({ type: "success", message: "g#inner ungrouped into 2 children" });
    expect(session.capturePlacement("r1").getParentId()).toBe("outer");

    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "g#inner restored" });
    const placement = session.capturePlacement("inner");
    expect(placement.getParentId()).toBe("outer");
    expect(placement.getIndex()).toBe(0);
    expect(session.capturePlacement("r1").getParentId()).toBe("inner");

    await executor.execute(new RedoCommand());
    expect(session.capturePlacement("r1").getParentId()).toBe("outer");
  });

  it("addto 和 reorder 撤销恢复原索引", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new GroupShape("g1")));
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));
    await executor.execute(new CreateCommand(new CircleShape("r2", 0, 0, 1)));

    await executor.execute(new AddToCommand("g1", "r1"));
    expect(session.capturePlacement("r1").getParentId()).toBe("g1");
    await executor.execute(new UndoCommand());
    expect(session.capturePlacement("r1").getParentId()).toBeUndefined();
    expect(session.capturePlacement("r1").getIndex()).toBe(1);

    await executor.execute(new ReorderCommand("r2", "front"));
    expect(session.capturePlacement("r2").getIndex()).toBe(0);
    await executor.execute(new UndoCommand());
    expect(session.capturePlacement("r2").getIndex()).toBe(2);
  });

  it("set 撤销恢复叶子旧值，并按叶子恢复容器的不同旧值", async () => {
    const { session, executor } = createEditor();
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1, "red")));
    await executor.execute(new CreateCommand(new CircleShape("r2", 0, 0, 1)));
    await executor.execute(new CreateCommand(new TextShape("t1", 0, 0, "old")));
    await executor.execute(new GroupCommand("g1", ["r1", "r2"]));

    await executor.execute(new SetCommand("g1", "fill", "blue"));
    expect(session.captureAttribute("r1", "fill").getValue("r1")).toBe("blue");
    expect(session.captureAttribute("r2", "fill").getValue("r2")).toBe("blue");
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "g#g1 updated: fill unset" });
    expect(session.captureAttribute("r1", "fill").getValue("r1")).toBe("red");
    expect(session.captureAttribute("r2", "fill").getValue("r2")).toBeUndefined();

    await executor.execute(new SetCommand("t1", "text", "new"));
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: 'text#t1 updated: text="old"' });
  });

  it("失败编辑不入栈且不会解除历史锁", async () => {
    const { executor } = createEditor();
    await initialize(executor);

    expectErrorMessage(
      await executor.execute(new MoveCommand("missing", 1, 1)),
      CommandErrorCode.ShapeNotFound,
      "no such shape: missing",
    );
    expectErrorMessage(
      await executor.execute(new UndoCommand()),
      CommandErrorCode.HistoryUnavailable,
      "undo not allowed after io command",
    );

    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 deleted" });
  });

  it("未执行的状态型命令不能直接撤销", async () => {
    const { session } = createEditor();
    const commands = [
      new DeleteCommand("r1"),
      new GroupCommand("g1", ["r1", "r2"]),
      new UngroupCommand("g1"),
      new AddToCommand("g1", "r1"),
      new ReorderCommand("r1", "front"),
      new SetCommand("r1", "fill", "red"),
    ];

    for (const command of commands) {
      const result = await command.undo(session);
      expectErrorMessage(
        result,
        CommandErrorCode.InvalidArgument,
        `command has not been executed: ${command.type}`,
      );
    }
  });

  it("read 替换文档、输出警告、清空历史并锁定撤销", async () => {
    const storage = new InMemorySvgStorage();
    storage.files.set("demo.svg", `<svg width="400" height="300">
  <rect x="0" y="0" width="400" height="300" fill="#fff"/>
  <g id="g1"><circle id="c1" cx="10" cy="20" r="5"/></g>
</svg>`);
    const { executor } = createEditor(storage);

    expect((await executor.execute(new ReadCommand("demo.svg"))).toCommandResultDto()).toEqual({
      type: "success",
      message: [
        "warning: assigned id rect1 to unnamed <rect>",
        "read demo.svg (3 elements)",
      ].join("\n"),
    });
    expect((await executor.execute(new CanvasCommand())).toCommandResultDto()).toEqual({
      type: "success",
      message: "canvas 400x300",
    });
    expectErrorMessage(
      await executor.execute(new UndoCommand()),
      CommandErrorCode.HistoryUnavailable,
      "undo not allowed after io command",
    );

    await executor.execute(new CreateCommand(new TextShape("t1", 0, 0, "new")));
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "text#t1 deleted" });
  });

  it("read 失败返回 IoRead 并保留原文档", async () => {
    const storage = new InMemorySvgStorage();
    storage.readError = new Error("missing file");
    const { session, executor } = createEditor(storage);
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));

    expectErrorMessage(
      await executor.execute(new ReadCommand("missing.svg")),
      CommandErrorCode.IoRead,
      "cannot read file: missing.svg",
    );
    expect(session.capturePlacement("r1").getParentId()).toBeUndefined();
  });

  it("read 解析失败不替换文档，也不清空历史", async () => {
    const storage = new InMemorySvgStorage();
    storage.files.set("broken.svg", "<svg");
    const { session, executor } = createEditor(storage);
    await initialize(executor);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));

    expectErrorMessage(
      await executor.execute(new ReadCommand("broken.svg")),
      CommandErrorCode.InvalidArgument,
      "invalid SVG: invalid XML",
    );
    expect(session.capturePlacement("r1").getParentId()).toBeUndefined();
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "rect#r1 deleted" });
  });

  it("save 使用显式路径、统计元素并锁定历史", async () => {
    const storage = new InMemorySvgStorage();
    const { executor } = createEditor(storage);
    await initialize(executor, 320, 240);
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 10, 10, "red")));
    await executor.execute(new CreateCommand(new CircleShape("c1", 5, 5, 2)));

    expect((await executor.execute(new SaveCommand("out.svg"))).toCommandResultDto()).toEqual({
      type: "success",
      message: "saved to out.svg (2 elements)",
    });
    expect(storage.files.get("out.svg")).toContain(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"',
    );
    expect(storage.files.get("out.svg")).toContain(
      '<rect id="r1" x="0" y="0" width="10" height="10" fill="red"/>',
    );
    expectErrorMessage(
      await executor.execute(new UndoCommand()),
      CommandErrorCode.HistoryUnavailable,
      "undo not allowed after io command",
    );
  });

  it("save 无参数复用 read 路径，并覆盖缺路径与写失败分支", async () => {
    const storage = new InMemorySvgStorage();
    storage.files.set("demo.svg", '<svg width="10" height="10"/>');
    const { executor } = createEditor(storage);

    await initialize(executor);
    expectErrorMessage(
      await executor.execute(new SaveCommand()),
      CommandErrorCode.InvalidArgument,
      "save requires a file path",
    );

    await executor.execute(new ReadCommand("demo.svg"));
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));
    expect((await executor.execute(new SaveCommand())).toCommandResultDto()).toEqual({
      type: "success",
      message: "saved to demo.svg (1 elements)",
    });
    expect(storage.files.get("demo.svg")).toContain('<rect id="r1"');

    storage.writeError = new Error("readonly");
    await executor.execute(new CreateCommand(new CircleShape("c1", 1, 1, 1)));
    expectErrorMessage(
      await executor.execute(new SaveCommand("blocked.svg")),
      CommandErrorCode.IoWrite,
      "cannot write file: blocked.svg",
    );
    expect(
      (await executor.execute(new UndoCommand())).toCommandResultDto(),
    ).toEqual({ type: "success", message: "circle#c1 deleted" });
  });

  it("显示命令要求文档，help 无文档也可用", async () => {
    const { executor } = createEditor();

    expectErrorMessage(
      await executor.execute(new TreeCommand()),
      CommandErrorCode.NoDocument,
      "no document. use 'init' or 'read' first",
    );
    expectErrorMessage(
      await executor.execute(new ShowCommand("r1")),
      CommandErrorCode.NoDocument,
      "no document. use 'init' or 'read' first",
    );

    const help = (await executor.execute(new HelpCommand())).toCommandResultDto();
    expect(help.type).toBe("success");
    expect(JSON.stringify(help)).toContain("Commands:");
    expect(JSON.stringify(help)).toContain("tree [id]");
  });

  it("tree 与 show 输出文档结构和属性明细", async () => {
    const { executor } = createEditor();
    await initialize(executor, 800, 600);
    await executor.execute(new CreateCommand(new RectShape("bg", 0, 0, 800, 600, "#fff")));
    await executor.execute(new CreateCommand(new CircleShape("c1", 100, 100, 20, "red")));
    await executor.execute(new CreateCommand(new RectShape("box", 200, 80, 60, 60)));
    await executor.execute(new GroupCommand("markers", ["c1", "box"]));

    const tree = (await executor.execute(new TreeCommand())).toCommandResultDto();
    expect(tree).toEqual({
      type: "success",
      message: [
        "svg (800x600)",
        "├── rect#bg    x=0 y=0 w=800 h=600 fill=#fff",
        "└── g#markers",
        "    ├── circle#c1  cx=100 cy=100 r=20 fill=red",
        "    └── rect#box   x=200 y=80 w=60 h=60",
      ].join("\n"),
    });

    const subtree = (await executor.execute(new TreeCommand("markers"))).toCommandResultDto();
    expect(subtree).toEqual({
      type: "success",
      message: [
        "g#markers",
        "├── circle#c1  cx=100 cy=100 r=20 fill=red",
        "└── rect#box   x=200 y=80 w=60 h=60",
      ].join("\n"),
    });

    expect((await executor.execute(new ShowCommand("c1"))).toCommandResultDto()).toEqual({
      type: "success",
      message: [
        "circle#c1  parent=g#markers",
        "  cx=100 cy=100 r=20",
        "  fill=red",
      ].join("\n"),
    });
    expect((await executor.execute(new ShowCommand("bg"))).toCommandResultDto()).toEqual({
      type: "success",
      message: [
        "rect#bg  parent=svg",
        "  x=0 y=0 w=800 h=600",
        "  fill=#fff",
      ].join("\n"),
    });

    expectErrorMessage(
      await executor.execute(new TreeCommand("missing")),
      CommandErrorCode.ShapeNotFound,
      "no such shape: missing",
    );
    expectErrorMessage(
      await executor.execute(new ShowCommand("missing")),
      CommandErrorCode.ShapeNotFound,
      "no such shape: missing",
    );
  });

  it("CommandExecutor 只转换协议错误，未知异常继续上抛", async () => {
    const { executor } = createEditor();

    class ExplodingCommand extends Command {
      public readonly type = "help";

      public async execute(): Promise<CommandResult> {
        throw new Error("boom");
      }
    }

    await expect(executor.execute(new ExplodingCommand())).rejects.toThrow("boom");
  });
});
