import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PluginConfigLoader } from "@/host/PluginConfigLoader";

describe("PluginConfigLoader", () => {
  it("解析合法配置", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-config-"));
    const path = join(dir, "plugins.config.json");
    writeFileSync(
      path,
      JSON.stringify({
        plugins: [
          { module: "./a", enabled: false },
          { module: "./b", options: { fill: "#f00" } },
        ],
      }),
    );

    const config = new PluginConfigLoader().loadFromFile(path);
    expect(config.getPlugins()).toHaveLength(2);
    expect(config.getPlugins()[0].isEnabled()).toBe(false);
    expect(config.getPlugins()[1].getOptions()).toEqual({ fill: "#f00" });
  });

  it("结构非法时抛 invalid plugin config", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-plugin-config-"));
    const path = join(dir, "bad.json");
    writeFileSync(path, "{");

    expect(() => new PluginConfigLoader().loadFromFile(path)).toThrow(
      "invalid plugin config",
    );
  });
});
