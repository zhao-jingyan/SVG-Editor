import { PluginContributes } from "@/protocol/plugins/PluginContributes";
import { DirCommandPlugin } from "@/_plugin/commands/DirCommand/DirCommandPlugin";
import { StatsCommandPlugin } from "@/_plugin/commands/StatsCommand/StatsCommandPlugin";
import { ModifiedStarPlugin } from "@/_plugin/tree/ModifiedStarPlugin";
import type { PluginHost } from "@/host/PluginHost";

/**
 * 方式 A（改代码）：组合根显式实例化并装入插件；新增插件只改本文件。
 * 与方式 B 共用 PluginHost.activate 注册路径（暂存 → 清单校验 → 提交）。
 * 顺序：命令 → box（含 (box) 标签）→ modified-star，保证树行 ` (box) *`。
 */
export class CodePluginInstaller {
  public constructor(private readonly host: PluginHost) {}

  public async install(): Promise<void> {
    await this.host.activate(
      new StatsCommandPlugin(),
      PluginContributes.of({ commands: ["stats"] }),
    );
    await this.host.activate(
      new DirCommandPlugin(),
      PluginContributes.of({ commands: ["dir"] }),
    );
    await this.host.activate(
      new ModifiedStarPlugin(),
      PluginContributes.of({ decorators: ["modified-star"] }),
    );
  }
}
