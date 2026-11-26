import type { Command } from "@/protocol/commands/Command";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import type { DirectoryListing } from "@/protocol/io/DirectoryListing";
import { DirCommand } from "./DirCommand";
import { NodeDirectoryListing } from "./NodeDirectoryListing";

/** dir 命令贡献：目录访问经 DirectoryListing 端口注入（适配器模式的 Target）。 */
export class DirCommandContribution extends CommandContribution {
  public static create(
    directoryListing: DirectoryListing = new NodeDirectoryListing(),
    directoryPath?: string,
  ): CommandContribution {
    return new DirCommandContribution(directoryListing, directoryPath);
  }

  private constructor(
    private readonly directoryListing: DirectoryListing,
    private readonly directoryPath: string | undefined,
  ) {
    super("dir", "dir", new CommandHelp("dir", "list files in the working directory"));
  }

  protected override buildCommand(parameters: CommandParameters): Command {
    parameters.expectLength(0);
    return new DirCommand(
      this.directoryListing,
      this.directoryPath ?? process.cwd(),
    );
  }
}
