import { describe, expect, it } from "vitest";
import { Document } from "@/core/document/Document";
import { SvgDocumentParser } from "@/core/io/SvgDocumentParser";
import { SvgDocumentWriter } from "@/core/io/SvgDocumentWriter";
import { CommandExecutor } from "@/core/CommandExecutor";
import { CommandHistory } from "@/core/history/CommandHistory";
import { HelpText } from "@/core/display/HelpText";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { BoxShape } from "@/_plugin/shapes/BoxShape/BoxShape";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ErrorSource } from "@/protocol/errors/ErrorSource";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";
import { createBuiltinCatalog } from "../../../support/createBuiltinCatalog";
import { createBuiltinShapeCatalog } from "../../../support/createBuiltinShapeCatalog";
import { createPluginShapeCatalog } from "../../../support/createPluginShapeCatalog";

describe("BoxShape 插件", () => {
  it("create 派生子部件并报告结构", async () => {
    const shapeCatalog = createPluginShapeCatalog();
    const history = new CommandHistory();
    const receiver = new EditorCommandReceiver(
      history,
      undefined,
      new HelpText(createBuiltinCatalog(shapeCatalog)),
      shapeCatalog,
    );
    const executor = new CommandExecutor(receiver, history);

    await executor.execute(new InitCommand(800, 600));
    const result = await executor.execute(
      new CreateCommand(BoxShape.create("n1", 120, 100, 160, 60, "开始")),
    );

    expect(result.toCommandResultDto()).toEqual({
      type: "success",
      message: "box#n1 created (g#n1 + rect#n1-rect + text#n1-label)",
    });

    const roots = receiver.getRootShapes();
    expect(roots).toHaveLength(1);
    const box = roots[0];
    expect(box).toBeInstanceOf(BoxShape);
    expect(box.getType()).toBe("box");
    expect(box.getDataKind()).toBe("box");

    if (!(box instanceof BoxShape)) {
      return;
    }

    const children = box.getChildren();
    expect(children[0]).toBeInstanceOf(RectShape);
    expect(children[1]).toBeInstanceOf(TextShape);
    expect(children[0].getId()).toBe("n1-rect");
    expect(children[1].getId()).toBe("n1-label");
    expect(children[0].getAttribute("fill")).toBe("#4a90d9");
  });

  it("写出 data-kind；有插件读回为 Box，无插件降级为 g", () => {
    const document = new Document(400, 300);
    document.addShape(BoxShape.create("n1", 10, 20, 100, 50, "标题"));
    const svg = new SvgDocumentWriter().render(document);

    expect(svg).toContain('data-kind="box"');
    expect(svg).toContain('id="n1-rect"');
    expect(svg).toContain('id="n1-label"');

    const withPlugin = new SvgDocumentParser(createPluginShapeCatalog()).parse(
      svg,
    );
    expect(withPlugin.getDocument().getShape("n1")).toBeInstanceOf(BoxShape);

    const withoutPlugin = new SvgDocumentParser(
      createBuiltinShapeCatalog(),
    ).parse(svg);
    const degraded = withoutPlugin.getDocument().getShape("n1");
    expect(degraded).toBeInstanceOf(GroupShape);
    expect(degraded).not.toBeInstanceOf(BoxShape);
    expect(degraded.getType()).toBe("g");
    expect(degraded.getDataKind()).toBeUndefined();
  });

  it("拒绝 ungroup 与拆掉必要子部件", () => {
    const document = new Document(100, 100);
    document.addShape(new GroupShape("scene"));
    document.addShape(BoxShape.create("n1", 0, 0, 40, 20, "t"), "scene");

    expect(() => document.ungroupShapes("n1")).toThrow(ProtocolError);
    try {
      document.ungroupShapes("n1");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ProtocolError);
      if (error instanceof ProtocolError) {
        expect(error.getSource()).toBe(ErrorSource.Document);
        expect(error.getCode()).toBe(CommandErrorCode.InvalidArgument);
        expect(error.message).toBe("cannot ungroup composite shape: n1");
      }
    }

    expect(() => document.deleteShape("n1-rect")).toThrow(
      /cannot modify composite shape structure: n1-rect/,
    );
  });

  it("残缺 box SVG 在装插件时拒绝读入", () => {
    const parser = new SvgDocumentParser(createPluginShapeCatalog());
    expect(() =>
      parser.parse(`<svg width="10" height="10">
  <g id="n1" data-kind="box">
    <rect id="n1-rect" x="0" y="0" width="1" height="1"/>
  </g>
</svg>`),
    ).toThrow(/invalid box#n1/);
  });

  it("子树 id 冲突时 create 失败", () => {
    const document = new Document(100, 100);
    document.addShape(new RectShape("n1-rect", 0, 0, 1, 1));
    expect(() =>
      document.addShape(BoxShape.create("n1", 0, 0, 10, 10, "t")),
    ).toThrow(/id already exists: n1-rect/);
  });
});
