import { PluginConfigEntry } from "./PluginConfigEntry";

/** 根级 plugins.config.json。 */
export class PluginConfig {
  public constructor(private readonly plugins: readonly PluginConfigEntry[]) {}

  public static fromUnknown(raw: unknown): PluginConfig {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new Error("plugin config must be an object");
    }

    const record = raw as Record<string, unknown>;
    if (!Array.isArray(record.plugins)) {
      throw new Error("plugin config.plugins must be an array");
    }

    return new PluginConfig(
      record.plugins.map((entry) => PluginConfigEntry.fromUnknown(entry)),
    );
  }

  public getPlugins(): readonly PluginConfigEntry[] {
    return this.plugins;
  }
}
