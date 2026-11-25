import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import type { DirectoryListing } from "@/protocol/io/DirectoryListing";
import { DirCommand } from "./DirCommand";
import { NodeDirectoryListing } from "./NodeDirectoryListing";

export class DirCommandContribution {
  public static create(
    directoryListing: DirectoryListing = new NodeDirectoryListing(),
    directoryPath?: string,
  ): CommandContribution {
    return new CommandContribution(
      "dir",
      "dir",
      new CommandHelp("dir", "list files in the working directory"),
      (parameters) => {
        parameters.expectLength(0);
        return new DirCommand(directoryListing, directoryPath ?? process.cwd());
      },
    );
  }
}
