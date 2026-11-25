import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PluginModuleLoader } from "@/host/PluginModuleLoader";

describe("PluginModuleLoader", () => {
  it("加载默认导出类与 package.json contributes", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-mod-"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "demo-plugin",
        contributes: { commands: ["demo"] },
      }),
    );
    writeFileSync(
      join(dir, "index.js"),
      [
        '"use strict";',
        "class DemoPlugin {",
        "  constructor() { this.name = 'demo-plugin'; }",
        "  activate() {}",
        "}",
        "module.exports = { default: DemoPlugin };",
        "",
      ].join("\n"),
    );

    const loaded = new PluginModuleLoader().load("./index.js", dir);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }
    expect(loaded.plugin.name).toBe("demo-plugin");
    expect(loaded.contributes.getCommands()).toEqual(["demo"]);
  });

  it("模块找不到", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-mod-"));
    const loaded = new PluginModuleLoader().load("./missing", dir);
    expect(loaded).toEqual({ ok: false, kind: "not_found" });
  });

  it("没有默认导出", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-mod-"));
    writeFileSync(join(dir, "empty.js"), "module.exports = {};\n");
    const loaded = new PluginModuleLoader().load("./empty.js", dir);
    expect(loaded).toEqual({ ok: false, kind: "no_default_export" });
  });

  it("依赖求值失败不报 not_found", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-mod-"));
    const nested = join(dir, "broken");
    mkdirSync(nested);
    writeFileSync(
      join(nested, "index.js"),
      'require("./does-not-exist-dep");\n',
    );

    const loaded = new PluginModuleLoader().load("./broken", dir);
    expect(loaded.ok).toBe(false);
    if (loaded.ok) {
      return;
    }
    expect(loaded.kind).toBe("load_failed");
  });
});
