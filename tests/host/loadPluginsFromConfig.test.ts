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

  describe("四类加载失败与回滚（经配置文件到宿主的完整路径）", () => {
    function createWorld(): {
      errors: string[];
      commands: CommandRegistry;
      decorators: TreeDecoratorRegistry;
      host: PluginHost;
    } {
      const errors: string[] = [];
      const commands = new CommandRegistry();
      const decorators = new TreeDecoratorRegistry();
      const host = new PluginHost(
        commands,
        new ShapeRegistry(),
        new AttributeRegistry(),
        decorators,
        (message) => errors.push(message),
      );
      return { errors, commands, decorators, host };
    }


    it("依赖求值失败、清单不一致、activate 抛错、重复注册各自报错，且互不影响后续插件", async () => {
      const dir = mkdtempSync(join(tmpdir(), "svg-plugin-cfg-"));
      const decoratorSource = (name: string): string =>
        `class Dec { getName() { return '${name}'; } decorateShape() { return ''; } decorateCanvas() { return ''; } onDocumentSynced() {} }`;

      writePlugin(
        dir,
        "broken-dep",
        'require("./no-such-dependency");\n',
        {},
      );
      writePlugin(
        dir,
        "mismatch",
        [
          decoratorSource("real-name"),
          "class P { constructor(){ this.name='mismatch'; } activate(ctx){ ctx.registerDecorator(new Dec()); } }",
          "module.exports = { default: P };",
        ].join("\n"),
        { decorators: ["declared-name"] },
      );
      writePlugin(
        dir,
        "throws",
        [
          decoratorSource("staged-before-throw"),
          "class P { constructor(){ this.name='throws'; } activate(ctx){ ctx.registerDecorator(new Dec()); throw new Error('boom'); } }",
          "module.exports = { default: P };",
        ].join("\n"),
        { decorators: ["staged-before-throw"] },
      );
      writePlugin(
        dir,
        "first",
        [
          decoratorSource("shared"),
          "class P { constructor(){ this.name='first'; } activate(ctx){ ctx.registerDecorator(new Dec()); } }",
          "module.exports = { default: P };",
        ].join("\n"),
        { decorators: ["shared"] },
      );
      writePlugin(
        dir,
        "dup",
        [
          decoratorSource("only-in-dup"),
          decoratorSource("shared").replace("class Dec", "class Dec2"),
          "class P { constructor(){ this.name='dup'; } activate(ctx){ ctx.registerDecorator(new Dec()); ctx.registerDecorator(new Dec2()); } }",
          "module.exports = { default: P };",
        ].join("\n"),
        { decorators: ["only-in-dup", "shared"] },
      );
      writePlugin(
        dir,
        "last",
        [
          decoratorSource("last-ok"),
          "class P { constructor(){ this.name='last'; } activate(ctx){ ctx.registerDecorator(new Dec()); } }",
          "module.exports = { default: P };",
        ].join("\n"),
        { decorators: ["last-ok"] },
      );

      const configPath = join(dir, "plugins.config.json");
      writeFileSync(
        configPath,
        JSON.stringify({
          plugins: [
            { module: "./broken-dep" },
            { module: "./mismatch" },
            { module: "./throws" },
            { module: "./first" },
            { module: "./dup" },
            { module: "./last" },
          ],
        }),
      );

      const { errors, decorators, host } = createWorld();
      await loadPluginsFromConfig(host, configPath, (message) =>
        errors.push(message),
      );

      expect(errors).toHaveLength(4);
      expect(errors[0]).toMatch(
        /^error: plugin failed to activate: \.\/broken-dep \(Cannot find module/,
      );
      expect(errors[0]).not.toContain("plugin not found");
      expect(errors[1]).toBe(
        "error: plugin manifest mismatch: mismatch (declared: decorators/declared-name, registered: decorators/real-name)",
      );
      expect(errors[2]).toBe("error: plugin failed to activate: throws (boom)");
      expect(errors[3]).toBe("error: duplicate registration: decorators/shared");

      // 失败插件的全部暂存注册被撤销（含 dup 中先成功暂存的 only-in-dup），已成功插件保留
      expect(decorators.getDecorators().map((item) => item.getName())).toEqual([
        "shared",
        "last-ok",
      ]);
    });

    it("enabled:false 完全跳过；options 传给 activate；相对路径以配置文件目录为基准", async () => {
      const dir = mkdtempSync(join(tmpdir(), "svg-plugin-cfg-"));
      mkdirSync(join(dir, "conf"), { recursive: true });
      writePlugin(
        join(dir, "conf"),
        "opts",
        [
          "class Dec { constructor(n){ this.n=n; } getName() { return this.n; } decorateShape() { return ''; } decorateCanvas() { return ''; } onDocumentSynced() {} }",
          "class P { constructor(){ this.name='opts'; } activate(ctx){ ctx.registerDecorator(new Dec(String(ctx.getOptions().label))); } }",
          "module.exports = { default: P };",
        ].join("\n"),
        { decorators: ["from-options"] },
      );
      writePlugin(
        join(dir, "conf"),
        "off",
        "throw new Error('must not be evaluated');\n",
        {},
      );
      const configPath = join(dir, "conf", "plugins.config.json");
      writeFileSync(
        configPath,
        JSON.stringify({
          plugins: [
            { module: "./opts", options: { label: "from-options" } },
            { module: "./off", enabled: false },
          ],
        }),
      );

      const { errors, decorators, host } = createWorld();
      // 工作目录与配置目录不同，证明相对路径不依赖 cwd
      await loadPluginsFromConfig(host, configPath, (message) =>
        errors.push(message),
      );

      expect(errors).toEqual([]);
      expect(decorators.getDecorators().map((item) => item.getName())).toEqual([
        "from-options",
      ]);
    });
  });
});
