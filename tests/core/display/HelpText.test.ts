import { describe, expect, it } from "vitest";
import { BuiltinCommandPlugin } from "../../../src/cli/plugins/BuiltinCommandPlugin";
import { CommandDefinitionRegistry } from "../../../src/cli/parser/commands/definition/CommandDefinitionRegistry";
import { HelpText } from "../../../src/core/display/HelpText";
import { PluginHost } from "../../../src/plugins/PluginHost";
import { CommandHelp } from "../../../src/protocol/plugins/CommandHelp";
import type { PluginContext } from "../../../src/protocol/plugins/PluginContext";
import { CommandRegistration } from "../../../src/protocol/plugins/CommandRegistration";
import type { SvgPlugin } from "../../../src/protocol/plugins/SvgPlugin";
import { HelpCommand } from "../../../src/protocol/commands/view/HelpCommand";
import { ShapeFactory } from "../../../src/protocol/shapes/factory/ShapeFactory";

async function createBuiltinRegistry(): Promise<CommandDefinitionRegistry> {
  const registry = new CommandDefinitionRegistry();
  await new PluginHost({ commands: registry }).activate(
    new BuiltinCommandPlugin(new ShapeFactory()),
  );
  return registry;
}

describe("HelpText", () => {
  it("保持 Phase 1 help 输出逐字节不变", async () => {
    const registry = await createBuiltinRegistry();

    expect(new HelpText(registry).render()).toBe([
      "Commands:",
      "  init [width height]                 create a new canvas (default 800x600)",
      "  read <file.svg>                     read an SVG file",
      "  save [file.svg]                     save the current document",
      "  canvas [width height]               show or resize the canvas",
      "  create <type> <id> [params...]      create a shape",
      "  delete <id>                         delete a shape and its subtree",
      "  move <id> <dx> <dy>                 move a shape",
      "  scale <id> <factor>                 scale a shape",
      "  set <id> <attribute> <value>        set a shape attribute",
      "  group <newGid> <id1> <id2>...       group existing shapes",
      "  ungroup <gid>                       ungroup a container",
      "  addto <gid> <id>                    move a shape into a container",
      "  front <id> | back <id>              change z-order",
      "  tree [id]                           show the shape tree",
      "  show <id>                           show shape attributes",
      "  undo | redo                         undo or redo an edit",
      "  help                                show this help",
      "  exit                                leave the editor",
    ].join("\n"));
  });

  it("插件新增命令后只追加对应 help 行", async () => {
    const registry = await createBuiltinRegistry();
    const plugin: SvgPlugin = {
      name: "stats-plugin",
      activate(context: PluginContext): void {
        context.commands.register(
          new CommandRegistration(
            "stats",
            "stats",
            new CommandHelp("stats", "show shape statistics"),
            () => new HelpCommand(),
          ),
        );
      },
    };
    await new PluginHost({ commands: registry }).activate(plugin);

    const lines = new HelpText(registry).render().split("\n");

    expect(lines[lines.length - 1]).toBe(
      "  stats                               show shape statistics",
    );
  });
});
