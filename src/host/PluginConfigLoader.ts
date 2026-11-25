import { readFileSync } from "node:fs";
import { PluginConfig } from "./PluginConfig";

/** 读取并解析 plugins.config.json；结构非法时抛错。 */
export class PluginConfigLoader {
  public loadFromFile(configPath: string): PluginConfig {
    let text: string;
    try {
      text = readFileSync(configPath, "utf8");
    } catch {
      throw new Error("invalid plugin config");
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      throw new Error("invalid plugin config");
    }

    try {
      return PluginConfig.fromUnknown(raw);
    } catch {
      throw new Error("invalid plugin config");
    }
  }
}
