import type { PluginContext } from "@/protocol/plugins/PluginContext";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";
import { DirCommandContribution } from "./DirCommandContribution";

/** dir 命令插件；options.directoryPath 可覆盖工作目录。 */
export class DirCommandPlugin implements SvgPlugin {
  public readonly name = "@svgframe/plugin-command-dir";

  public activate(context: PluginContext): void {
    const options = context.getOptions();
    const directoryPath =
      typeof options.directoryPath === "string"
        ? options.directoryPath
        : undefined;
    context.registerCommand(DirCommandContribution.create(undefined, directoryPath));
  }
}

export default DirCommandPlugin;
