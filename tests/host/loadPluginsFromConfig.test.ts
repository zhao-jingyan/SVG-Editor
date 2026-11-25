import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { loadPluginsFromConfig } from "@/host/loadPluginsFromConfig";
import { PluginHost } from "@/host/PluginHost";

function writePlugin(
  dir: string,
  folder: string,
  body: string,
  contributes: Record<string, unknown>,
): void {
  const pluginDir = join(dir, folder);
  mkdirSync(pluginDir, { recursive: true });
  writeFileSync(
    join(pluginDir, "package.json"),
    JSON.stringify({ name: folder, contributes }),
  );
  writeFileSync(join(pluginDir, "index.js"), body);
}

describe("loadPluginsFromConfig", () => {
  it("按序装入 enabled 插件并跳过失败项", async () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-cfg-"));
    writePlugin(
      dir,
      "good",
      [
        '"use strict";',
        "class Dec { getName() { return 'alpha'; } decorateShape() { return ''; } decorateCanvas() { return ''; } onDocumentSynced() {} }",
        "class Plug { constructor(){ this.name='good'; } activate(ctx){ ctx.registerDecorator(new Dec()); } }",
        "module.exports = { default: Plug };",
        "",
      ].join("\n"),
      { decorators: ["alpha"] },
    );
    writePlugin(
      dir,
      "bad-export",
      "module.exports = {};\n",
      { decorators: ["x"] },
    );

    const configPath = join(dir, "plugins.config.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        plugins: [
          { module: "./missing-mod" },
          { module: "./bad-export" },
          { module: "./good" },
          { module: "./skipped", enabled: false },
        ],
      }),
    );

    const errors: string[] = [];
    const decorators = new TreeDecoratorRegistry();
    const host = new PluginHost(
      new CommandRegistry(),
      new ShapeRegistry(),
      new AttributeRegistry(),
      decorators,
      (message) => errors.push(message),
    );

    await loadPluginsFromConfig(host, configPath, (message) =>
      errors.push(message),
    );

    expect(errors).toEqual([
      "error: plugin not found: ./missing-mod",
      "error: plugin has no default export: ./bad-export",
    ]);
    expect(decorators.getDecorators().map((item) => item.getName())).toEqual([
      "alpha",
    ]);
  });

  it("配置非法时只报错不抛出", async () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-cfg-"));
    const configPath = join(dir, "bad.json");
    writeFileSync(configPath, "{");

    const errors: string[] = [];
    const host = new PluginHost(
      new CommandRegistry(),
      new ShapeRegistry(),
      new AttributeRegistry(),
      new TreeDecoratorRegistry(),
      (message) => errors.push(message),
    );

    await loadPluginsFromConfig(host, configPath, (message) =>
      errors.push(message),
    );

    expect(errors).toEqual(["error: invalid plugin config"]);
  });
});
