import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { PluginContributes } from "@/protocol/plugins/PluginContributes";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";

export type PluginModuleLoadResult =
  | {
      readonly ok: true;
      readonly plugin: SvgPlugin;
      readonly contributes: PluginContributes;
      readonly resolvedPath: string;
    }
  | {
      readonly ok: false;
      readonly kind: "not_found" | "no_default_export" | "load_failed";
      readonly reason?: string;
    };

/**
 * 按字符串模块名解析插件；不含具体插件名硬编码。
 * 相对路径以 basedir（通常为配置文件目录）为基准。
 */
export class PluginModuleLoader {
  private readonly require = createRequire(__filename);

  public load(moduleId: string, basedir: string): PluginModuleLoadResult {
    let resolvedPath: string;
    try {
      resolvedPath = this.require.resolve(moduleId, { paths: [basedir] });
    } catch {
      return { ok: false, kind: "not_found" };
    }

    let exports: unknown;
    try {
      // 测试与热加载场景允许重复求值
      delete this.require.cache[resolvedPath];
      exports = this.require(resolvedPath);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      return { ok: false, kind: "load_failed", reason };
    }

    const plugin = this.toPlugin(exports);
    if (plugin === null) {
      return { ok: false, kind: "no_default_export" };
    }

    let contributes: PluginContributes;
    try {
      contributes = this.readContributes(resolvedPath);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      return { ok: false, kind: "load_failed", reason };
    }

    return { ok: true, plugin, contributes, resolvedPath };
  }

  private toPlugin(exports: unknown): SvgPlugin | null {
    if (exports === null || exports === undefined) {
      return null;
    }

    const record = exports as { default?: unknown };
    const candidate = record.default !== undefined ? record.default : exports;

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      typeof (candidate as SvgPlugin).activate === "function" &&
      typeof (candidate as SvgPlugin).name === "string"
    ) {
      return candidate as SvgPlugin;
    }

    if (typeof candidate === "function") {
      try {
        const instance = new (candidate as new () => SvgPlugin)();
        if (
          typeof instance.activate === "function" &&
          typeof instance.name === "string"
        ) {
          return instance;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  private readContributes(resolvedPath: string): PluginContributes {
    const packageJsonPath = join(dirname(resolvedPath), "package.json");
    let text: string;
    try {
      text = readFileSync(packageJsonPath, "utf8");
    } catch {
      return PluginContributes.empty();
    }

    const pkg = JSON.parse(text) as { contributes?: unknown };
    return PluginContributes.fromUnknown(pkg.contributes);
  }
}
