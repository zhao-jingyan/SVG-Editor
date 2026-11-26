import { readdir } from "node:fs/promises";
import { DirectoryEntry } from "@/protocol/io/DirectoryEntry";
import { DirectoryEntryKind } from "@/protocol/io/DirectoryEntryKind";
import type { DirectoryListing } from "@/protocol/io/DirectoryListing";

/**
 * DirectoryListing 的 Node 适配器（Adapter）。
 * Target：DirectoryListing；Adaptee：node:fs/promises.readdir。
 * 目录用 [DIR]；其余（普通文件、符号链接等）一律按 [FILE] 列出，不跟随链接目标。
 */
export class NodeDirectoryListing implements DirectoryListing {
  public async list(path: string): Promise<readonly DirectoryEntry[]> {
    const dirents = await readdir(path, { withFileTypes: true });
    const entries: DirectoryEntry[] = [];

    for (const dirent of dirents) {
      if (dirent.name === "." || dirent.name === "..") {
        continue;
      }

      const kind = dirent.isDirectory()
        ? DirectoryEntryKind.Directory
        : DirectoryEntryKind.File;
      entries.push(new DirectoryEntry(kind, dirent.name));
    }

    return entries;
  }
}
