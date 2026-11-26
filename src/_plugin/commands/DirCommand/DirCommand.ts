import { Command } from "@/protocol/commands/Command";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { DirectoryEntry } from "@/protocol/io/DirectoryEntry";
import type { DirectoryListing } from "@/protocol/io/DirectoryListing";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { CommandErrorResult } from "@/protocol/results/outcomes/CommandErrorResult";
import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";

export class DirCommand extends Command {
  public constructor(
    private readonly directoryListing: DirectoryListing,
    private readonly directoryPath: string = process.cwd(),
  ) {
    super();
  }

  public async execute(_receiver: CommandReceiver): Promise<CommandResult> {
    let entries: readonly DirectoryEntry[];

    try {
      entries = await this.directoryListing.list(this.directoryPath);
    } catch {
      return new CommandErrorResult(
        ProtocolError.commandExecution(
          CommandErrorCode.IoRead,
          `cannot read directory: ${this.directoryPath}`,
        ),
      );
    }

    return new CommandSuccessResult(this.formatEntries(entries));
  }

  private formatEntries(entries: readonly DirectoryEntry[]): string {
    if (entries.length === 0) {
      return "(empty directory)";
    }

    const directories = this.sortedNames(entries, true);
    const files = this.sortedNames(entries, false);

    const lines: string[] = [];
    for (const name of directories) {
      lines.push(`[DIR]  ${name}`);
    }
    for (const name of files) {
      lines.push(`[FILE] ${name}`);
    }
    return lines.join("\n");
  }

  /** 按 UTF-16 码元序排序（与区域设置无关）：大写字母先于小写，`.` 先于字母。 */
  private sortedNames(
    entries: readonly DirectoryEntry[],
    directories: boolean,
  ): string[] {
    return entries
      .filter((entry) => entry.isDirectory() === directories)
      .map((entry) => entry.getName())
      .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  }
}
