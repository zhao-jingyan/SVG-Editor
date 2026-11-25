import { describe, expect, it } from "vitest";
import { DirectoryEntry } from "@/protocol/io/DirectoryEntry";
import { DirectoryEntryKind } from "@/protocol/io/DirectoryEntryKind";

describe("DirectoryEntry", () => {
  it("封装目录与文件项", () => {
    const directory = new DirectoryEntry(DirectoryEntryKind.Directory, "docs");
    const file = new DirectoryEntry(DirectoryEntryKind.File, ".gitignore");

    expect(directory.isDirectory()).toBe(true);
    expect(directory.getName()).toBe("docs");
    expect(file.isFile()).toBe(true);
    expect(file.getKind()).toBe(DirectoryEntryKind.File);
  });

  it("拒绝空名、. 、.. 与路径分隔符", () => {
    expect(() => new DirectoryEntry(DirectoryEntryKind.File, "")).toThrow();
    expect(() => new DirectoryEntry(DirectoryEntryKind.File, ".")).toThrow();
    expect(() => new DirectoryEntry(DirectoryEntryKind.File, "..")).toThrow();
    expect(
      () => new DirectoryEntry(DirectoryEntryKind.File, "a/b"),
    ).toThrow();
  });
});
